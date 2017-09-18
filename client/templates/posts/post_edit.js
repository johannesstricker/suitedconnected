Template.postEdit.onCreated(function() {
	var instance = this;
	instance.errors = new ReactiveVar({});
	instance.submittedTags = new ReactiveVar(instance.data.post.findTags().fetch());
	instance.body = instance.data.body;
	instance.handhistory = new ReactiveVar(null);

	if(instance.data.post.handhistory) {
		parseHandHistory(instance.data.post.handhistory.raw, function(hh, error) {
			if(error) {
				instance.handhistory.set(null);
				let errors = instance.errors.get();
				errors.handhistory = error.reason;
				instance.errors.set(errors);
				return;
			}
			let errors = instance.errors.get();
			delete errors.handhistory;
			instance.errors.set(errors);
			instance.handhistory.set(hh);
		});			
	}
});

Template.postEdit.helpers({
	errorMessage: function(field) {
		return Template.instance().errors.get()[field];
	},
	errorClass: function(field) {
		return !!Template.instance().errors.get()[field] ? 'has-error' : '';
	},
	tagInputSettings: function() {
		return { reference: Template.instance().submittedTags, placeholder: 'Enter between one and five tags, that accurately describe your post.' };
	},
});

/** Returns postAttributes from the template's form. */
var getFormValues = function(e, template) {
	return {
		body: $(e.target).find('#body').summernote('code'),
		title: $(e.target).find('#title').val(),
		tagIds: _.map(template.submittedTags.get(), function(tag) {return tag._id;}),		
	};
};

Template.postEdit.events({
	'submit form': function(e, template) {
		e.preventDefault();

		/* Gather data. */
		var currentPostId = this.post._id;
		var postAttributes = getFormValues(e, template);

		/* Validate input. */
		var errors = PostsSchema.validate(postAttributes, {title: 'Please enter a title.', body: 'Please enter a post.', tagIds: 'Please select between one and five tags.'});

		if(template.data.post.handhistory) {
			postAttributes.handhistory = template.handhistory.get();
			if(postAttributes.handhistory === null) {
				errors.handhistory = "Invalid handhistory.";
			}
		}

		template.errors.set(errors);
		if(Object.keys(errors).length > 0) {
			return;
		}

		/* Call update. */
		Meteor.call('Post.edit', currentPostId, postAttributes, function(error, result) {
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
});