Template.cardSelector.onCreated(function() {
	var self = this;
	self.settings = {
		excluded: [],
		selected: [],
		min: -1,
		max: 52,
		accept: function(cards) {},
		cancel: function() {}
	};
	if(self.data) {
		self.settings = _.extend(self.settings, self.data);
	}

	self.excluded = new ReactiveVar(self.settings.excluded);
	self.selected = new ReactiveVar(self.settings.selected);
	self.max = new ReactiveVar(self.settings.max);
	self.min = new ReactiveVar(self.settings.min);
	self.acceptCallback = self.settings.accept;
	self.cancelCallback = self.settings.cancel;

	self.cards = [];
	var suits = ['d', 'h', 'c', 's'];
	var ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
	for(let i = 0; i < suits.length; i++) {
		let cardsOfSuit = [];
		for(let j = 0; j < ranks.length; j++) {
			let card = ranks[j] + suits[i];
			cardsOfSuit.push(card);
		}
		self.cards.push(cardsOfSuit);
	}
	self.cards = new ReactiveVar(self.cards);

	self.acceptEnabled = function() {
		let selected = self.selected.get();
		return selected.length >= self.min.get() && selected.length <= self.max.get();
	};
})

Template.cardSelector.helpers({
	suits: function() {
		return Template.instance().cards.get();
	},
	selected: function(card) {
		return _.indexOf(Template.instance().selected.get(), card) !== -1 ? 'selected' : '';
	},
	excluded: function(card) {
		return _.indexOf(Template.instance().excluded.get(), card) !== -1;
	},
	acceptEnabled: function() {
		return Template.instance().acceptEnabled();
	}
});

Template.cardSelector.events({
	'click .card': function(e, template) {
		e.preventDefault();
		let card = $(e.target).attr('data-card');
		if(card === '') {
			return;
		}

		let selected = template.selected.get();
		let index = _.indexOf(selected, card);
		if(index < 0) {
			selected.push(card);
		} else {
			selected.splice(index, 1);
		}
		template.selected.set(selected);
	},
	'click #accept': function(e, template) {
		e.preventDefault();
		if(!template.acceptEnabled()) {
			return;
		}
		let cards = template.selected.get();
		template.acceptCallback(cards);
	},
	'click #cancel': function(e, template) {
		e.preventDefault();
		template.cancelCallback();
	}
});