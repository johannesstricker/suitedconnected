Meteor.publish('Announcements.public', function() {
	return Announcements.findPending();
});