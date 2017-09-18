var getFormData = function(e, template) {
	post = {
		body: $(e.target).find('#body').summernote('code'),
		title: $(e.target).find('#title').val(),
		tagIds: _.map(template.submittedTags.get(), function(tag) { return tag._id; }),
	};
	/* Get group. */
	var group = template.currentGroup.get();
	if(group && group._id) {
		post.groupId = group._id;
	}
	return post;
};

Template.postSubmit.onCreated(function() {
	this.errors = new ReactiveVar({});
	this.submittedTags = new ReactiveVar([]);
	var currentGroup = this.data.group ? {_id: this.data.group._id, name: this.data.group.name} : {_id: null, name: 'Public'};
	this.currentGroup = new ReactiveVar(currentGroup);
	this.sending = false;
	this.handhistory = new ReactiveVar(null);
});

Template.postSubmit.onRendered(function() {
});

Template.postSubmit.helpers({
	tagInputSettings: function() {
		return { reference: Template.instance().submittedTags, placeholder: 'Enter between one and five tags, that accurately describe your post.' };
	},
	groups: function() {
		return Groups.find({members: Meteor.userId()}).fetch();
	},
	currentGroup: function() {
		return Template.instance().currentGroup.get().name;
	},
	publicPostWarning: function() {
		return Template.instance().currentGroup.get().name === 'Public' ? 'Note: You are posting this in the public area.' : '';
	},
	handhistory: function() {
		return Template.instance().handhistory.get();
	},
	getFormData: function(e) {
		return {
			body: $(e.target).find('#body').summernote('code'),
			title: $(e.target).find('[name=title]').val(),
			tagIds: _.map(this.submittedTags.get(), function(tag) { return tag._id; }),
		};
	},
	maxTitleLength: function() {
		return PostsSchema._schema.title.max;
	},
});

Template.postSubmit.events({
	'submit form': function(e, template) {
		e.preventDefault();
		if(template.sending) {
			return;
		}
		var post = getFormData(e, template);

		/* Validation */
		var errors = PostsSchema.validate(post, {title: 'Please choose a meaningful title with at most 100 characters.', body: 'Please provide some more information on your question.', tagIds: 'Please select between one and five tags.'});
		if(this.submitHandhistory) {
			post.handhistory = template.handhistory.get();
			if(post.handhistory === null) {
				errors.handhistory = "Invalid handhistory.";
			}
		}
		if(Object.keys(errors).length > 0) {
			return template.errors.set(errors);
		}

		template.sending = true;
		Meteor.call('Post.create', post, function(error, result) {
			template.sending = false;
			if(error) {
				return throwError(error.reason);
			}

			Router.go('postPage', {_id: result._id});
		});
	},
	'input #handhistory-input': function(e, template) {
		var input = $(e.target).val();
		parseHandHistory(input, function(hh, error) {
			if(error) {
				template.handhistory.set(null);
				let errors = template.errors.get();
				errors.handhistory = error.reason;
				template.errors.set(errors);
				return;
			}
			let errors = template.errors.get();
			delete errors.handhistory;
			template.errors.set(errors);
			template.handhistory.set(hh);
		});	
	},
	'click .group-public': function(e, template) {
		e.preventDefault();
		template.currentGroup.set({name: 'Public', _id: null});
	},
	'click .group-each': function(e, template) {
		e.preventDefault();
		template.currentGroup.set({name: this.name, _id: this._id});
	}
});