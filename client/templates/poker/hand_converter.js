Template.handHistory.onCreated(function() {
	const instance = this;
	this.showdownVisible = new ReactiveVar(false);
	this.showSelector = new ReactiveVar(false);
	this.selectorSettings = new ReactiveVar({
		min: 2,
		max: 2,
	});
	instance.requiredWidth = 0;
	instance.handhistory = new ReactiveVar(null);
	instance.updatePlayerWidth = function() {
		if(!instance.hhContainer) {
			return;
		}
		instance.hhContainer.removeClass('handhistory-small');
		let players = instance.hhContainer.find('.player');
		instance.requiredWidth = _.reduce(players, function(memo, elem) {
			return memo + $(elem).outerWidth(true);
		}, players.length * 10);
	}
	instance.fitHandhistory = function() {
		if(!instance.hhContainer) {
			return;
		}
		let minWidth = Math.max(instance.requiredWidth, 500);
		let actualWidth = instance.hhContainer.outerWidth(true);
		if(actualWidth < minWidth) {
			instance.hhContainer.addClass('handhistory-small');
		} else {
			instance.hhContainer.removeClass('handhistory-small');
		}
	};

	instance.autorun(function() {
		if(Template.currentData()) {
			instance.handhistory.set(Template.currentData().handhistory);
			instance.updatePlayerWidth();
			instance.fitHandhistory();
		}
	});

	$(window).on('resize', function(e) {
		instance.fitHandhistory();
	});
});
Template.handHistory.onRendered(function() {
	const instance = this;
	instance.hhContainer = instance.$('.handhistory');
	Meteor.setTimeout(function() {
		instance.updatePlayerWidth();
		instance.fitHandhistory();
	}, 250);
});
Template.handHistory.helpers({
	showdownClass: function() {
		return Template.instance().showdownVisible.get() ? 'visible' : '';
	},
	visible: function() {
		return Template.instance().showdownVisible.get();
	},
	showCardSelector: function() {
		return Template.instance().showSelector.get();
	},
	cardSelectorSettings: function() {
		return Template.instance().selectorSettings.get();
	}
});
Template.handHistory.events({
	'click #spoiler': function(e, template) {
		e.preventDefault();
		template.showdownVisible.set(true);
	},
});

Template.handConverter.events({
	'input #hh-input': function(e, template) {
		var input = $(e.target).val();
		template.handhistory.set(new HandHistory());
		template.showdownVisible.set(false);
		parseHandHistory(input, function(hh, error) {
			if(error) {
				return throwError(error.reason);
			}
			template.handhistory.set(hh);
		});
	},
});

Template.actions.helpers({
	preprocessedActions: function() {
		var actions = [];
		var folds = [];
		for(let i = 0; i < this.length; i++) {
			let action = this[i];
			if(action.action === 'FOLD') {
				folds.push(action);
			} else {
				if(folds.length === 1) {
					actions.push(folds[0]);
					folds = [];
				} else if (folds.length > 1) {
					actions.push({
						player: {name: folds.length},
						value: null,
						action: 'FOLD'
					});
					folds = [];
				}
				actions.push(action);
			}
		}
		if(folds.length === 1) {
			actions.push(folds[0]);
			folds = [];
		} else if(folds.length > 1) {
			actions.push({
				player: {name: folds.length},
				value: null,
				action: 'FOLD'
			});
			folds = [];
		}
		actions[actions.length - 1].last = true;
		return actions;
	}
})

Template.action.helpers({
	actionClasses: function() {
		var classes = [];
		if(this.player.hero) {
			classes.push('hero');
		}

		if(this.action === "BET" || this.action === "RAISE") {
			classes.push('aggressive');
		} else {
			classes.push('passive');
		}

		if(this.action === "FOLD") {
			classes.push('fold');
		}

		return classes.join(' ');
	},
	formattedAction: function() {
		var action = this.player.name + " " + this.action.toLowerCase() + "s";
		if(this.value) {
			action += " " + this.value.toFixed(2);
		}
		return action;
	}
});

Template.showdownAction.helpers({
	formattedAction: function() {
		return this.action.toLowerCase() + 's';
	},
	winOrLose: function() {
		return this.value >= 0 ? 'wins' : 'loses';
	},
	winOrLoseClass: function() {
		return this.value >= 0 ? 'win' : 'lose';
	}
});