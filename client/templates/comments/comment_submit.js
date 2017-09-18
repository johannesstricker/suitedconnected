Template.commentSubmit.onCreated(function() {
	var instance = this;
	instance.errors = new ReactiveVar({});
	instance.sending = false;

	instance.isEditing = function() {
		return !!Template.currentData().comment && !!Template.currentData().comment.get();
	};
	instance.getBody = function() {
		var $body = instance.$('#comment-body');
		return $body.summernote('code');
	};
	instance.validateBody = function(body) {
		var errors = CommentsSchema.validate({body: body}, {body: 'Please enter a comment.'});
		instance.errors.set(errors);
		return Object.keys(errors).length === 0;
	};
	instance.updateComment = function() {
		let commentId = instance.data.comment.get()._id;
		let body = instance.getBody();
		if(!instance.validateBody(body)) {
			return;
		}
		/* Insert */
		instance.$('#comment-body').summernote('code', '');
		instance.sending = true;
		Meteor.call('Comment.edit', commentId, body, function(error, result) {
			instance.sending = false;
			if(error) {
				instance.$('#comment-body').summernote('code', body);
				return throwError(error.reason);
			}
			instance.data.comment.set(null);
		});
	};
	instance.submitComment = function() {
		let postId = instance.data.post._id;
		let body = instance.getBody();
		if(!instance.validateBody(body)) {
			return;
		}
		/* Insert */
		let comment = {body: body, postId: postId};
		instance.$('#comment-body').summernote('code', '');
		instance.sending = true;
		Meteor.call('Comment.create', comment, function(error, result) {
			instance.sending = false;
			if(error) {
				instance.$('#comment-body').summernote('code', body);
				return throwError(error.reason);
			}
		});
	};
});

Template.commentSubmit.helpers({
	isEditing: function() {
		const instance = Template.instance();
		return instance.isEditing();
	},
});

Template.commentSubmit.events({
	'submit form': function(e, instance) {
		e.preventDefault();
		if(instance.sending) {
			return;
		}

		if(instance.isEditing()) {
			instance.updateComment();
		} else {
			instance.submitComment();
		}
	},
	'click .js-cancel-edit': function(e, instance) {
		e.preventDefault();
		instance.data.comment.set(null);
	},
});