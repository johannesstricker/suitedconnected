Template.postItem.helpers({
	'upvotedClass': function() {
		return Template.instance().data.canUpvote() ? 'btn-primary upvotable' : 'btn-default';
	}
});

Template.postItem.events({
	'click #upvote': function(e, template) {
		e.preventDefault();
		Meteor.call('Post.upvote', this._id, function(error, result) {
			if(error) {
				return throwError(error);
			}
		});
	},
});
