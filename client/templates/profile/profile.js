Template.profile.helpers({
    notificationCount: function() {
        return Counts.get('notifications');
    }
});

Template.profile.events({
	'click .js-click-logout': function(e, template) {
		e.preventDefault();
		Meteor.logout();
	}
});