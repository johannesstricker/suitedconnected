/** Parsing rules for the HEM Plain Text format. */
HMPlain = [
	/* Table Info with Ante */
	{name: 'TableInfo', pattern: ['Client', 'Value', 'Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.client = tokens[0].value;
		hh.table.smallblind = tokens[1].value;
		hh.table.bigblind = tokens[2].value;
		hh.table.ante = tokens[3].value;
		hh.table.variant = tokens[4].value;
		hh.table.numPlayers = tokens[5].value;
	}},
	/* Table Info with Ante  with unknown Client */
	{name: 'TableInfo', pattern: ['Value', 'Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.smallblind = tokens[0].value;
		hh.table.bigblind = tokens[1].value;
		hh.table.ante = tokens[2].value;
		hh.table.variant = tokens[3].value;
		hh.table.numPlayers = tokens[4].value;
	}},
	/* Table Info */
	{name: 'TableInfo', pattern: ['Client', 'Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.client = tokens[0].value;
		hh.table.smallblind = tokens[1].value;
		hh.table.bigblind = tokens[2].value;
		hh.table.variant = tokens[3].value;
		hh.table.numPlayers = tokens[4].value;
	}},
	/* Table Info with unknown Client */
	{name: 'TableInfo', pattern: ['Value', 'Value', 'Variant', 'Value'], map: function(hh, cursor, tokens) {
		hh.table.smallblind = tokens[0].value;
		hh.table.bigblind = tokens[1].value;
		hh.table.variant = tokens[2].value;
		hh.table.numPlayers = tokens[3].value;
	}},
	/* Hero */
	{name: 'Hero', pattern: ['Position', 'Position', 'Value', 'Value'], map: function(hh, cursor, tokens) {
		hh.players.push({
			hero: true,
			name: 'Hero',
			position: tokens[1].value,
			chips: tokens[2].value,
			winnings: 0,
			cards: [],
		});
		hh.players.sort(comparePlayers);
		cursor.players =  _.clone(hh.players);
	}},
	/* Player */
	{name: 'Player', pattern: ['Position', 'Value', 'Value'], map: function(hh, cursor, tokens) {
		hh.players.push({
			hero: false,
			name: tokens[0].value,
			position: tokens[0].value,
			chips: tokens[1].value,
			winnings: 0,
			cards: [],
		});
		hh.players.sort(comparePlayers);
		cursor.players =  _.clone(hh.players);
	}},
	/* Preflop */
	{name: 'Preflop', pattern: ['Preflop', 'Position', 'Position', 'Cards'], map: function(hh, cursor, tokens) {
		hh.hero().cards = tokens[3].value;
		cursor.pot = hh.table.smallblind + hh.table.bigblind;
		hh.preflop.pot = cursor.pot;
		hh.preflop.players = _.clone(cursor.players);
		if(hh.table.ante) {
			hh.preflop.pot += hh.preflop.players.length * hh.table.ante;
		}
		cursor.setToAct('EP');
	}},
	/* Flop */
	{name: 'Flop', pattern: ['Flop', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'flop';
		hh.flop.players = _.clone(cursor.players);
		hh.flop.cards = tokens[2].value;
		hh.flop.pot = tokens[1].value;
		cursor.setToAct('SB');
	}},
	/* Turn */
	{name: 'Turn', pattern: ['Turn', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'turn';
		hh.turn.players = _.clone(cursor.players);
		hh.turn.cards = tokens[2].value;
		hh.turn.pot = tokens[1].value;
		cursor.setToAct('SB');
	}},
	/* River */
	{name: 'River', pattern: ['River', 'Value', 'Cards'], map: function(hh, cursor, tokens) {
		cursor.street = 'river';
		hh.river.players = _.clone(cursor.players);
		hh.river.cards = tokens[2].value;
		hh.river.pot = tokens[1].value;
		cursor.setToAct('SB');
	}},
	/* Showdown */
	{name: 'Showdown', pattern: ['Showdown', 'Value'], map: function(hh, cursor, tokens) {
		cursor.street = 'showdown';
		hh.showdown.players = _.clone(cursor.players);
		hh.showdown.pot = tokens[1].value;		
	}},
	/* Value Action */
	{name: 'Action', pattern: ['Position', 'Action', 'Value'], map: function(hh, cursor, tokens) {
		let street = hh[cursor.street];
		street.actions.push({
			player: hh.findName(tokens[0].value),
			action: tokens[1].value,
			value: tokens[2].value
		});
		cursor.pot += tokens[2].value;
		cursor.action();
	}},
	/* Action */
	{name: 'Action', pattern: ['Position', 'Action'], map: function(hh, cursor, tokens) {
		let street = hh[cursor.street];
		street.actions.push({
			player: hh.findName(tokens[0].value),
			action: tokens[1].value,
			value: null
		});
		if(tokens[1].value === 'FOLD') {
			cursor.fold();
		} else {
			cursor.action();
		}
	}},
	/* Shorthand Action */
	{name: 'Action', pattern: ['Value', 'Action'], map: function(hh, cursor, tokens) {
		let street = hh[cursor.street];
		for(let i = 0; i < tokens[0].value; i++) {
			street.actions.push({
				player: cursor.currentPlayer,
				action: tokens[1].value,
				value: null
			});
			if(tokens[1].value === 'FOLD') {
				cursor.fold();
			} else {
				cursor.action();
			}			
		}
	}},
	/* Showdown Action Hero */
	{name: 'ShowdownAction', pattern: ['Position', 'Action', 'Cards', 'Result', 'Value', 'Value'], map: function(hh, cursor, tokens) {
		let player = hh.findName(tokens[0].value);
		player.cards = tokens[2].value;
		// player.winnings = tokens[5].value;
		hh.showdown.actions.push({
			player: player,
			action: tokens[1].value,
			value: tokens[5].value
		});
		cursor.action();
	}},
	/* Showdown Action Show */
	{name: 'ShowdownAction', pattern: ['Position', 'Action', 'Cards', 'Result', 'Value'], map: function(hh, cursor, tokens) {
		let player = hh.findName(tokens[0].value);
		player.cards = tokens[2].value;
		// player.winnings = tokens[4].value;
		hh.showdown.actions.push({
			player: player,
			action: tokens[1].value,
			value: tokens[4].value
		});
		cursor.action();
	}},
	/* Showdown Action Muck */
	{name: 'ShowdownAction', pattern: ['Position', 'Action', 'Result', 'Value'], map: function(hh, cursor, tokens) {
		let player = hh.findName(tokens[0].value);
		hh.showdown.actions.push({
			player: player,
			action: tokens[1].value,
			value: tokens[3].value
		});
		cursor.action();
	}},
];