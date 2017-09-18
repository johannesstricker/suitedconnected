/** Parsing rules for the PT4 BBCode format. */
PT4BBCode = [
	/** Table Info Ante */
	{name: 'TableInfo', pattern: ['Client', 'Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.client = tokens[0].value;
		hh.table.bigblind = tokens[1].value;
		hh.table.smallblind = hh.table.bigblind / 2;
		hh.table.ante = tokens[2].value;
		hh.table.numPlayers = tokens[4].value;
		hh.table.variant = tokens[3].value;
	}},
	/** Table Info Ante (Unknown Client) */
	{name: 'TableInfo', pattern: ['Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.bigblind = tokens[0].value;
		hh.table.smallblind = hh.table.bigblind / 2;
		hh.table.ante = tokens[1].value;
		hh.table.numPlayers = tokens[3].value;
		hh.table.variant = tokens[2].value;
	}},
	/** Table Info */
	{name: 'TableInfo', pattern: ['Client', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.client = tokens[0].value;
		hh.table.bigblind = tokens[1].value;
		hh.table.smallblind = hh.table.bigblind / 2;
		hh.table.numPlayers = tokens[3].value;
		hh.table.variant = tokens[2].value;
	}},
	/** Table Info (Unknown Client) */
	{name: 'TableInfo', pattern: ['Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.bigblind = tokens[0].value;
		hh.table.smallblind = hh.table.bigblind / 2;
		hh.table.numPlayers = tokens[2].value;
		hh.table.variant = tokens[1].value;
	}},
	/** Hero */
	{name: 'Hero', pattern: ['Position', 'Position', 'Value'], map: function(hh, cursor, tokens) {
		hh.players.push({
			hero: true,
			name: tokens[0].value,
			position: tokens[1].value,
			chips: tokens[2].value,
			winnings: 0,
			cards: []
		});
		hh.players.sort(comparePlayers);
		cursor.players = _.clone(hh.players);
	}},
	/** Player */
	{name: 'Player', pattern: ['Position', 'Value'], map: function(hh, cursor, tokens) {
		hh.players.push({
			hero: false,
			name: tokens[0].value,
			position: tokens[0].value,
			chips: tokens[1].value,
			winnings: 0,
			cards: []
		});
		hh.players.sort(comparePlayers);
		cursor.players = _.clone(hh.players);
	}},
	/** Preflop */
	{name: 'Preflop', pattern: ['Preflop', 'Value', 'Position', 'Cards'], map: function(hh, cursor, tokens) {
		hh.hero().cards = tokens[3].value;
		cursor.pot = hh.table.smallblind + hh.table.bigblind;
		hh.preflop.pot = cursor.pot;
		hh.preflop.players = _.clone(cursor.players);
		if(hh.table.ante) {
			hh.preflop.pot += hh.preflop.players.length * hh.table.ante;
		}
		cursor.setToAct('EP');		
	}},
	/** Flop */
	{name: 'Flop', pattern: ['Flop', 'Value', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'flop';
		hh.flop.players = _.clone(cursor.players);
		hh.flop.cards = tokens[3].value;
		hh.flop.pot = tokens[1].value;
		cursor.setToAct('SB');	
	}},
	/** Turn */
	{name: 'Turn', pattern: ['Turn', 'Value', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'turn';
		hh.turn.players = _.clone(cursor.players);
		hh.turn.cards = tokens[3].value;
		hh.turn.pot = tokens[1].value;
		cursor.setToAct('SB');	
	}},
	/** River */
	{name: 'River', pattern: ['River', 'Value', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'river';
		hh.river.players = _.clone(cursor.players);
		hh.river.cards = tokens[3].value;
		hh.river.pot = tokens[1].value;
		cursor.setToAct('SB');		
	}},
	/** Post Blind */
	{name: 'PostBlind', pattern: ['Position', 'Post', 'Position', 'Value'], map: function(hh, cursor, tokens) {
		// do nothing
		let player = hh.findName(tokens[0].value);
		player.winnings -= tokens[3].value;
	}},
	/** Showdown Action  [Hero shows...] */
	{name: 'ShowdownAction', pattern: ['Position', 'Action', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'showdown';
		hh.showdown.players = _.clone(cursor.players);
		hh.showdown.pot = cursor.pot;

		let player = hh.findName(tokens[0].value);
		player.cards = tokens[2].value;

		hh.showdown.actions.push({
			player: player,
			action: tokens[1].value,
			value: player.winnings
		});
		cursor.action();				
	}},
	/** Showdown Result [Hero wins...] */
	{name: 'ShowdownResult', pattern: ['Position', 'Result', 'Value'], map: function(hh, cursor, tokens) {
		for(let i = 0; i < hh.showdown.actions.length; i++) {
			let action = hh.showdown.actions[i];
			if(action.player.name === tokens[0].value) {
				action.player.winnings += tokens[2].value;
				action.value = action.player.winnings;
				return;
			}
		}	
		let player = hh.findName(tokens[0].value);
		player.winnings += tokens[2].value;
		hh.showdown.actions.push({
			player: player,
			action: 'MUCK',
			value: player.winnings
		});
	}},
	/** Action without position and value */
	{name: 'Action', pattern: ['Action'], map: function(hh, cursor, tokens) {
		let player = cursor.currentPlayer();
		hh[cursor.street].actions.push({
			player: player,
			action: tokens[0].value
		});
		if(tokens[0].value === 'FOLD') {
			cursor.fold();
		} else {
			cursor.action();
		}
	}},
	/** Action without value */
	{name: 'Action', pattern: ['Position', 'Action'], map: function(hh, cursor, tokens) {
		let player = hh.findName(tokens[0].value);
		hh[cursor.street].actions.push({
			player: player,
			action: tokens[1].value
		});
		if(tokens[1].value === 'FOLD') {
			cursor.fold();
		} else {
			cursor.action();
		}
	}},
	/** Action with value */
	{name: 'Action', pattern: ['Position', 'Action', 'Value'], map: function(hh, cursor, tokens) {
		let player = hh.findName(tokens[0].value);
		hh[cursor.street].actions.push({
			player: player,
			action: tokens[1].value,
			value: tokens[2].value
		});
		cursor.pot += tokens[2].value;
		player.winnings -= tokens[2].value;
		if(tokens[1].value === 'FOLD') {
			cursor.fold();
		} else {
			cursor.action();
		}
	}},
];