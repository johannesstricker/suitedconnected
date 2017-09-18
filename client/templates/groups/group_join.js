Template.groupJoin.events({
	'click .accept-invitation': function(e, template) {
		e.preventDefault();
		Meteor.call('Group.join', this.group._id, function(error, result) {
			if(error) {
				return throwError(error);
			}
			Router.go('groupPage', {_id: result.groupId});
		});
	},
	'click .decline-invitation': function(e, template) {
		e.preventDefault();
		Meteor.call('Group.decline', this.group._id, function(error, result) {
			if(error) {
				return throwError(error);
			}
			Router.go('index');
		});
	}
});