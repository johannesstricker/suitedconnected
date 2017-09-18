/** General token definitions. */
HandHistoryTokens = [
	/* Newline. */
	// {pattern: /\n/, type: 'Newline', value: function(m) { return 'EOL'; }},

	/* Poker Client Patterns. */
	{pattern: /^Party|PartyPoker$/i, type: 'Client', value: function(m) { return 'PartyPoker'; }},
	{pattern: /^Prima|MicroGaming$/i, type: 'Client', value: function(m) { return 'MicroGaming'; }},
	{pattern: /^FullTilt|Tilt$/i, type: 'Client', value: function(m) { return 'FullTilt'; }},
	{pattern: /^Stars|PokerStars|Poker\sStars$/i, length:2, type: 'Client', value: function(m) { return 'PokerStars'; }},
	{pattern: /^Winamax$/i, type: 'Client', value: function(m) { return 'Winamax'; }},
	{pattern: /^iPoker$/i, type: 'Client', value: function(m) { return 'iPoker'; }},

	/* Positional Patterns. */
	{pattern: /^EP|UTG$/i, type: 'Position', value: function(m) { return 'EP'; }},
	{pattern: /^UTG\+1$/i, type: 'Position', value: function(m) { return 'EP+1'; }},
	{pattern: /^UTG\+2$/i, type: 'Position', value: function(m) { return 'EP+2'; }},
	{pattern: /^MP$/i, type: 'Position', value: function(m) { return 'MP'; }},
	{pattern: /^MP1$/i, type: 'Position', value: function(m) { return 'MP+1'; }},
	{pattern: /^MP2$/i, type: 'Position', value: function(m) { return 'MP+2'; }},
	{pattern: /^MP3$/i, type: 'Position', value: function(m) { return 'MP+3'; }},
	{pattern: /^CO$/i, type: 'Position', value: function(m) { return 'CO'; }},
	{pattern: /^BU|BTN$/i, type: 'Position', value: function(m) { return 'BU'; }},
	{pattern: /^SB$/i, type: 'Position', value: function(m) { return 'SB'; }},
	{pattern: /^BB$/, type: 'Position', value: function(m) { return 'BB'; }},

	/* TODO: Hero Pattern */
	{pattern: /^Hero$/i, type: 'Position', value: function(m) { return 'Hero'; }},

	/* Value Pattern. */
	{pattern: /^([\-]?[0-9]+(?:(?:\.|,)[0-9][0-9][0-9])*(?:(?:\.|,)[0-9][0-9]?)?)$/, type: 'Value', value: function(m) { 
		m = m.length > 1 ? m[1] : m[0];
		return parseFloat(m.replace(',', '.').removeDotsFromCurrencyString('.')); 
	}},

	/* Action Patterns. */
	{pattern: /^bet(?:s)?$/i, type: 'Action', value: function(m) { return 'BET'; }},
	{pattern: /^check(?:s)?$/i, type: 'Action', value: function(m) { return 'CHECK'; }},
	{pattern: /^call(?:s)?$/i, type: 'Action', value: function(m) { return 'CALL'; }},
	{pattern: /^fold(?:s)?$/i, type: 'Action', value: function(m) { return 'FOLD'; }},
	{pattern: /^raise(?:s)?$/i, type: 'Action', value: function(m) { return 'RAISE'; }},
	{pattern: /^show(s|ed)?$/i, type: 'Action', value: function(m) { return 'SHOW'; }},
	{pattern: /^muck(s|ed)?$/i, type: 'Action', value: function(m) { return 'MUCK'; }},

	/* Win / Lose Patterns. */
	{pattern: /^win|wins|won$/, type: 'Result', value: function(m) { return 'WIN'; }},
	{pattern: /^lose|loses|lost$/, type: 'Result', value: function(m) { return 'LOSE'; }},

	/* Post Blind Patterns. */
	{pattern: /^post(s)?$/, type: 'Post', value: function(m) { return 'POST'; }},

	/* Street Patterns. */
	{pattern: /^preflop$/i, length: 2, type: 'Preflop', value: function(m) { return 'PREFLOP'; }},
	{pattern: /^flop$/i, type: 'Flop', value: function(m) { return 'FLOP'; }},
	{pattern: /^turn$/i, type: 'Turn', value: function(m) { return 'TURN'; }},
	{pattern: /^river$/i, type: 'River', value: function(m) { return 'RIVER'; }},
	{pattern: /^results$/i, type: 'Showdown', value: function(m) { return 'RESULTS'; }},

	/* Mulitple Cards Patterns. */
	{pattern: /^([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])?([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])?([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])?([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])?$/, length: 5, type: 'Cards', value: function(m) { 
		var cards = [];
		for(let i = 1; i < m.length; i++) {
			if(m[i]) {
				cards.push(m[i]);			
			}
		}	
		return cards; 
	}},
	{pattern: /^([A|K|Q|J|T|9|8|7|6|5|4|3|2](?:diamond|spade|heart|club))([A|K|Q|J|T|9|8|7|6|5|4|3|2](?:diamond|spade|heart|club))?([A|K|Q|J|T|9|8|7|6|5|4|3|2](?:diamond|spade|heart|club))?([A|K|Q|J|T|9|8|7|6|5|4|3|2](?:diamond|spade|heart|club))?([A|K|Q|J|T|9|8|7|6|5|4|3|2](?:diamond|spade|heart|club))?$/, length: 5, type: 'Cards', value: function(m) { 
		var cards = []; 
		for(let i = 1; i < m.length; i++) {
			if(m[i]) {
				cards.push(m[i].substring(0,2));
			}
		}
		return cards;
	}},
	/* Card Patterns. */
	{pattern: /^([A|K|Q|J|T|9|8|7|6|5|4|3|2][d|s|h|c])$/, type: 'Card', value: function(m) { return m[0]; }},
	{pattern: /^([A|K|Q|J|T|9|8|7|6|5|4|3|2][diamond|spade|heart|club])$/, type: 'Card', value: function(m) { return m[1].substring(0,2); }},

	/* Variant Patterns. */
	{pattern: /^(NoLimitHoldem|HoldEmNoLimit|NL(.*)Holdem)$/i, length: 6, type: 'Variant', value: function(m) { return 'NLH'; }},

	/* Misc Patterns. */
	{pattern: /^Board$/, type: 'Misc', value: function(m) { return m[0]; }},
];