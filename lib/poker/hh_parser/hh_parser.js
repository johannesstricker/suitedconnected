

/** Removes the characters at index from string. */
String.prototype.removeAt = function(index) {
    return this.substr(0, index) + this.substr(index+1);
}
/** Removes all unnecessary dots from a currency string (all that have more than 2 trailing digits). */
String.prototype.removeDotsFromCurrencyString = function(search) {
	var output = this;
	var indexOfDot = output.indexOf('.');
	while(indexOfDot > -1 && indexOfDot < output.length && indexOfDot != output.length - 3 && indexOfDot != output.length - 2) {
		output = output.removeAt(indexOfDot);
		indexOfDot = output.indexOf('.');
	}
	return output;
}

/** Removes unnecessary characters from the string and prepares it for tokenization. */
var maskString = function(inputString) {
	var output = inputString;
	output = output.replace(/\[(\/)?[a-zA-Z0-9=]+\]/g, '');	// remove [BBCode] and [/BBCode]
	output = output.replace(/[^(\w|\d|\s|\.|,|\-|\/|\+)]/g, '');	// remove everything but char,digit,whitespace,dot,comma,slash,plus
	output = output.replace(/,\s/g, ' ');					// replace comma+whitespace with whitespace
	output = output.replace(/\(|\)/g, '');					// remove brackets	
	output = output.replace(/\//g, ' ');					// replace slash with whitespace
	return output;
}

/** Splits a string into pieces and then combines those pieces to individual tokens. */
var getTokens = function(inputString) {
	/* Step1: Split input string (based on whitespaces). */
	var stringPieces = inputString.split(/[\s\n]+/);
	stringPieces = stringPieces.map(function(piece) {
		return piece.trim();
	});

	/* Step2: Search each string for a matching token. Throw away all unknowns. */
	var matchedTokens = [];
	for(let s = 0; s < stringPieces.length; s++) {
		/* Iterate over the tokens and search for a match. */
		var match = false;
		for(let i = 0; i < HandHistoryTokens.length && !match; i++) {
			let token = HandHistoryTokens[i];

			/* Check if token consists of more than one words. */
			var tokenLength = _.has(token, 'length') ? token.length : 1;

			for(let l = tokenLength; l > 0 && !match; l--) {
				if(s + l <= stringPieces.length) {
					let tokenCandidate = stringPieces.slice(s, s + l).join('');
					let matches = tokenCandidate.match(token.pattern);
					if(matches !== null) {
						matchedTokens.push({type: token.type, value: token.value(matches)});
						s += l - 1; // increase s in case token was longer than 1
						match = true;		
					}
				}
			}
		}	
	}
	return matchedTokens;	
}

/** Combines the type of length input tokens to a string. */
var getTokenPattern = function(tokens, length) {
	var result = [];
	for(let i = 0; i < length; i++) {
		result.push(tokens[i].type);
	}
	return result.join('');
}

/** Gives semantics to a stream of tokens, based on input rules. */
var parseTokens = function(tokens, rules) {
	var matches = [];
	var parseErrors = [];
	var tokenCount = 1;

	while(tokens.length > 0) {
		var match = false;

		/* Traverse all rules and search for matching token stream. */
		for(let i = 0; i < rules.length; i++) {
			let rule = rules[i];

			if(tokens.length >= rule.pattern.length) {
				/* Check if the next tokens match this pattern. */
				let pattern = getTokenPattern(tokens, rule.pattern.length);
				if(pattern === rule.pattern.join('')) {
					/* Match found. */
					matches.push({map: rule.map, tokens: tokens.slice(0, rule.pattern.length)});
					tokens.splice(0, rule.pattern.length);
					tokenCount += rule.pattern.length;
					match = true;
					break;
				}
			}
		}

		/* If no match was found, we have a parse error. Throw away the token and keep trying. */
		if(!match) {
			parseErrors.push({tokenNumber: tokenCount, token: {pattern: tokens[0].pattern, type: tokens[0].type}});
			tokens.splice(0, 1);
			tokenCount++;
		}
	}
	return matches;
}


/** Takes a raw handhistory and parsing rules as input and outputs a Handhistory object. */
parseHandHistory = function(inputString, callback) {
	/* Try to identify the rules automatically. */
	if(inputString.indexOf('Powered By Holdem Manager') > -1) {				// HMPlain
		rules = HMPlain;
	} else if (inputString.indexOf('Hand converted by PokerTracker 4[/url]') > -1) {	// PT4BBCode
		/* Check if handhistory is in BB or $ */
		if(inputString.indexOf('posts BB 1 BB') > -1) {
			rules = PT4BBCodeBB;
		} else {
			rules = PT4BBCode;
		}
	} else {
		return callback(null, {error: 'invalid', reason: 'Unknown hand history format.'});
	}

	/* Sort rules longest to shortest. */
	var compareRules = function(lhs, rhs) {
		if(lhs.pattern.length > rhs.pattern.length) {
			return -1;
		}
		if(lhs.pattern.length < rhs.pattern.length) {
			return +1;
		}
		return 0;
	}
	rules.sort(compareRules);

	/* Check currency */
	var currency = '$';
	if(inputString.indexOf('€') > -1) {
		currency = '€';
	} else if (inputString.indexOf('£') > -1) {
		currency = '£';
	}

	/* Create an empty handhistory. */
	var handhistory = new HandHistory({raw: inputString});
	handhistory.table.currency = currency;
	var cursor = new HandHistoryCursor();

	/* Split string by lines. */
	var lines = inputString.split(/\n/);

	/* Iterate over each line */
	for(let i = 0; i < lines.length; i++) {
		var line = lines[i];

		/* Remove unnecessary characters from line. */
		var maskedString = maskString(line);
		/* Split line into tokens. */
		var tokens = getTokens(maskedString);
		/* Put tokens into context. */
		var matches = parseTokens(tokens, rules);
		/* Apply context rules to HH. */
		for(let i = 0; i < matches.length; i++) {
			var rule = matches[i];
			rule.map(handhistory, cursor, rule.tokens);
		}
	}

	/* Fix involved players. */
	_.each(cursor.players, function(player) {
		handhistory.findPosition(player.position).involved = true;
	});
	let hero = handhistory.hero();
	if(hero) {
		hero.involved = true;
	}

	/* Fix showdown. */
	let lastStreet = handhistory.lastStreet();
	if(lastStreet.name !== 'Showdown') {
		handhistory.showdown.pot = lastStreet.pot;
		handhistory.showdown.players = _.clone(cursor.players);
	}

	let error = HandHistorySchema.newContext().validate(handhistory) ? null : {error: 'invalid', reason: 'Invalid hand history.'};
	callback(handhistory, error);	// no error
	return handhistory;
}





