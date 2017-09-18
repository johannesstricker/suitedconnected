Template.groupList.helpers({
	groups: function() {
		if(Meteor.user()) {
			return Groups.find({$or: [{members: Meteor.user()._id}, {invitations: Meteor.user()._id}]});
		}
	},
});

