/* Tag-Input */
Template.tagInput.onCreated(function() {
	var self = this;
	var userSettings = this.data.settings || {};
	this.settings = _.extend({
		maxTags: 5,
		reference: null,
		maxSuggestions: 5,
		showDescription: true,
		triggerKeyCodes: [13 /*RETURN */],
		placeholder: ''
	}, userSettings);
	this.currentTags = (this.settings.reference instanceof ReactiveVar) ? this.settings.reference : new ReactiveVar([]);
	this.currentInput = new ReactiveVar('');
	this.suggestions = [];
	this.selectedTag = new ReactiveVar(null);

	this.addTag = function(tag) {
		if(!tag || !tag._id) {
			return;
		}
		var tags = self.currentTags.get();
		let tagAlreadyInserted = tags.filter(function(t) { return t._id === tag._id; }).length > 0;
		if(!tagAlreadyInserted && self.settings.maxTags > 0 && tags.length < self.settings.maxTags) {
			tags.push(tag);
			self.currentTags.set(tags);
			/* Reset input and focus */
			self.currentInput.set('');
			$('.tag-input-field #value').val('');
			$('.tag-input-field #value').focus();
		}
	}
	this.getSelectedTag = function() {
		let index = _.pluck(self.suggestions, 'name').indexOf(self.selectedTag.get());
		if(index > -1) {
			return self.suggestions[index];
		} else if (self.suggestions.length > 0) {
			return self.suggestions[0];
		}
		return null;
	}
	this.selectNext = function() {
		if(self.suggestions.length === 0) {
			return;
		}
		let index = _.pluck(self.suggestions, 'name').indexOf(self.selectedTag.get()) + 1;
		if(index < self.suggestions.length) {
			self.selectedTag.set(self.suggestions[index].name);
		}
	}
	this.selectPrevious = function() {
		if(self.suggestions.length === 0) {
			return;
		}
		let index = _.pluck(self.suggestions, 'name').indexOf(self.selectedTag.get()) - 1;
		if(index >= 0) {
			self.selectedTag.set(self.suggestions[index].name);
		}
	}
});

Template.tagInput.helpers({
	tags: function() {
		var tags = Template.instance().currentTags.get();
		$('.tag-input-field #value').prop( "disabled", tags.length >= Template.instance().settings.maxTags );
		if(tags.length >= Template.instance().settings.maxTags)
			$('.tag-input').addClass("disabled");
		else
			$('.tag-input').removeClass("disabled");

		return tags;
	},

	typeahead: function() {
		/* Return empty array if max tags have been selected. */
		let tags = Template.instance().currentTags.get();
		if(tags.length >= Template.instance().settings.maxTags) {
			return [];
		}

		/* Get Ids from excluded tags. */
		let tagIds = _.map(tags, function(tag) { return tag._id; });
		/* Get input. */
		let input = Template.instance().currentInput.get().trim();
		/* Gather all suggestions and cap to max */
		let max = (Template.instance().settings.maxSuggestions > 0) ? Template.instance().settings.maxSuggestions : Template.instance().suggestions.length;
		Template.instance().suggestions = Tags.search(input, tagIds).fetch();
		/* Filter already selected tags. */
		let selectedTags = _.pluck(Template.instance().currentTags.get(), 'name');
		Template.instance().suggestions = _.filter(Template.instance().suggestions, function(suggestion) {
			return selectedTags.indexOf(suggestion.name) === -1;
		}).slice(0, max);
		Template.instance().selectedTag.set(Template.instance().getSelectedTag() ? Template.instance().getSelectedTag().name : null);

		return Template.instance().suggestions;
	},

	showDescription: function() {
		return Template.instance().settings.showDescription;
	},

	placeholder: function() {
		return Template.instance().currentTags.get().length === 0 ? Template.instance().settings.placeholder : '';
	},
	selectedTagReference: function() {
		return Template.instance().selectedTag;
	},
});

Template.tagInput.events({
	/* React on certain key inputs */
	'keydown .tag-input-field': function(e, template) {
		if(_.indexOf(template.settings.triggerKeyCodes, (e.keyCode)) !== -1) {
			e.preventDefault();
			let selectedTag = template.getSelectedTag();
			if(selectedTag) {
				template.addTag(selectedTag);
			}
		} else if (e.keyCode === 38 /* Up Arrow */) {
			e.preventDefault();
			template.selectPrevious();
		} else if (e.keyCode === 40 /* Down Arrow */) {
			e.preventDefault();
			template.selectNext();
		}
	},

	/* Change current input */
	'input .tag-input-field': function(e, template) {
		$input = $(e.target);
		template.currentInput.set($input.val());
	},

	/* Remove tag on click */
	'click .tag-each': function(e, template) {
		var tags = template.currentTags.get();
		var tagId = this._id;
		tags = tags.filter(function(tag) {
			return tag._id !== tagId;
		});
		template.currentTags.set(tags);
		$('.tag-input-field #value').focus();
	},

	/* Add tag when clicked on typeahead */
	'click .suggestions .suggested-tag, touchend .suggestions .suggested-tag': function(e, template) {
		e.preventDefault();
		let selectedTag = template.getSelectedTag();
		if(selectedTag) {
			template.addTag(selectedTag);
		}
	},
});


Template.suggestion.helpers({
	selectedClass: function() {
		return Template.instance().data.selected.get() === Template.instance().data.tag.name ? 'selected' : null;
	},
});
Template.suggestion.events({
	'mouseenter .suggested-tag, touchstart .suggested-tag': function(e, template) {
		let name = template.data.tag.name;
		template.data.selected.set(name);
	},
});