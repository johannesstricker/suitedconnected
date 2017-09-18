var TableInfoSchema = new SimpleSchema({
	client: {
		type: String
	},
	variant: {
		type: String,
	},
	smallblind: {
		type: Number,
		decimal: true,
	},
	bigblind: {
		type: Number,
		decimal: true,
	},
	ante: {
		type: Number,
		decimal: true,
		optional: true,
	},
	numPlayers: {
		type: Number,
	},
	currency: {
		type: String
	}
});

var PlayerSchema = new SimpleSchema({
	name: {
		type: String,
		optional: true,
	},
	position: {
		type: String,
	},
	chips: {
		type: Number,
		decimal: true,
	},
	winnings: {
		type: Number,
		decimal: true,
		autoValue: function() {
			if(this.isSet) {
				return this.value;
			} else if(this.field('name').isSet) {
				return 0;
			}
		}
	},
	hero: {
		type: Boolean,
		optional: true,
		autoValue: function() {
			if(this.isSet) {
				return this.value;
			} else if(this.field('name').isSet) {
				return false;
			}
		}
	},
	involved: {
		type: Boolean,
		optional: true,
		autoValue: function() {
			if(this.isSet) {
				return this.value;
			} else if(this.field('name').isSet) {
				return false;
			}
		}
	},
	cards: {
		type: [String],
		// TODO: REGEX
	}
});

var ActionSchema = new SimpleSchema({
	player: {
		type: PlayerSchema,
		optional: true,
	},
	action: {
		type: String,
	},
	value: {
		type: Number,
		decimal: true,
		optional: true,
		autoValue: function() {
			if(this.isSet) {
				return this.value;
			}
		}
	},
	last: {
		type: Boolean,
		optional: true,
	}
});

var StreetSchema = new SimpleSchema({
	name: {
		type: String,
	},
	pot: {
		type: Number,
		decimal: true,
	},
	actions: {
		type: [ActionSchema],
	},
	players: {
		type: [PlayerSchema],
	},
	cards: {
		type: [String],
		// TODO: REGEX
	}
});

HandHistorySchema = new SimpleSchema({
	raw: {
		type: String,
		optional: true
	},
	format: {
		type: String,
		optional: true
	},
	edited: {
		type: Boolean,
		optional: true,
	},
	table: {
		type: TableInfoSchema,
	},
	players: {
		type: [PlayerSchema],
		minCount: 2,
		maxCount: 10,
	},
	preflop: {
		type: StreetSchema,
	},
	flop: {
		type: StreetSchema,
	},
	turn: {
		type: StreetSchema,
	},
	river: {
		type: StreetSchema,
	},
	showdown: {
		type: StreetSchema,
	}
});