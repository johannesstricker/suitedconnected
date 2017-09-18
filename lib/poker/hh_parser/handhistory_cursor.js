/** HandHistoryCursor is used to parse a hand history. */
HandHistoryCursor = function() {
	this.street = 'preflop';
	this.pot = 0;
	this.players = [];
	this.nextPlayer = 0; // next player is EP
};
HandHistoryCursor.prototype = {
	fold: function() {
		this.players.splice(this.nextPlayer, 1);
		this.nextPlayer = this.nextPlayer % this.players.length;
	},
	action: function(value) {
		this.nextPlayer = (this.nextPlayer + 1) % this.players.length;
	},
	currentPlayer: function() {
		return this.players[this.nextPlayer];
	},
	/** We assume that the players array is always sorted EP to BB.
	*	We look for the player sitting next to the input position, e.g. BB if we input SB and he already folded.
	*/
	setToAct: function(position) {
		this.nextPlayer = 0;
		for(let i = 0; i < this.players.length; i++) {
			if(comparePositions(this.players[i].position, position) >= 0) {
				this.nextPlayer = i;
				return;
			}
		}
	}
};
