/** HandHistory class */
HandHistory = function(params = {}) {
	if(params === undefined || params === null) {
		params = {};
	}
	var self = this;
	this.raw = '';
	this.format = '';
	this.edited = false;
	this.table = {client: 'Unknown Client', variant: 'Unknown Variant', smallblind: 0, bigblind: 0, numPlayers: 0, currency: '$'};
	this.players = [/*{name, position, chips, winnings, hero, involved}*/];
	this.preflop = {name: 'Preflop', pot: 0, actions: [], players: [], cards: []};
	this.flop = {name: 'Flop', pot: 0, actions: [], players: [], cards: []};
	this.turn = {name: 'Turn', pot: 0, actions: [], players: [], cards: []};
	this.river = {name: 'River', pot: 0, actions: [], players: [], cards: []};
	this.showdown = {name: 'Showdown', pot: 0, actions: [], players: [], cards: []};

	_.each(Object.keys(params), function(key) {
		self[key] = params[key];
	});

	this.preflop.board = function() {
		return [];
	};
	this.flop.board = function() {
		return self.flop.cards;
	};
	this.turn.board = function() {
		return self.flop.board().concat(self.turn.cards);
	};
	this.river.board = function() {
		return self.turn.board().concat(self.river.cards);
	};
	this.showdown.board = function() {
		return self.river.board();
	}
};
HandHistory.prototype = {
	sortPlayers: function() {
		this.players.sort(comparePositions);
	},
	streets: function() {
		return [this.preflop, this.flop, this.turn, this.river];
	},
	postflop: function() {
		let postflop = [];
		if(this.flop.board().length === 0) {
			return postflop;
		}
		postflop.push(this.flop);
		if(this.turn.board().length === this.flop.board().length) {
			return postflop;
		}
		postflop.push(this.turn);
		if(this.river.board().length === this.turn.board().length) {
			return postflop;
		}
		postflop.push(this.river);
		return postflop;
	},
	hero: function() {
		for(let i = 0; i < this.players.length; i++) {
			let player = this.players[i];
			if(player.hero) {
				return player;
			}
		}
		console.log("No hero found.");
	},
	sb: function() {
		for(let i = 0; i < this.players.length; i++) {
			let player = this.players[i];
			if(player.position === 'SB') {
				return player;
			}
		}		
	},
	bb: function() {
		for(let i = 0; i < this.players.length; i++) {
			let player = this.players[i];
			if(player.position === 'BB') {
				return player;
			}
		}	
	},
	dealer: function() {
		for(let i = 0; i < this.players.length; i++) {
			let player = this.players[i];
			/* in headsup games the dealer button is the smallblind */
			if(player.position === 'BU' || (this.players.length === 2 && player.position === 'SB')) {
				return player;
			}
		}	
	},
	findPosition: function(position) {
		for(let i = 0; i < this.players.length; i++) {
			if(this.players[i].position === position) {
				return this.players[i];
			}
		}
	},
	findName: function(name) {
		for(let i = 0; i < this.players.length; i++) {
			if(this.players[i].name === name) {
				return this.players[i];
			}
		}
	},
	lastStreet: function() {
		if(this.showdown.players.length > 0) {
			return this.showdown;
		}
		if(this.river.board().length > this.turn.board().length) {
			return this.river;
		}
		if(this.turn.board().length > this.flop.board().length) {
			return this.turn;
		}
		if(this.flop.board().length > this.preflop.board().length) {
			return this.flop;
		}
		return this.preflop;
	}
};