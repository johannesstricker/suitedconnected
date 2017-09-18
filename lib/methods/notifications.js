Meteor.methods({
	'Notification.markRead': function(notificationId) {
		check(this.userId, String);
		check(notificationId, String);
		Notifications.update({_id: notificationId, userId: this.userId}, {$set: {read: true}});		
	},

	'Notification.markAllRead': function() {
		check(this.userId, String);
		Notifications.update({userId: this.userId}, {$set: {read: true}}, {multi: true});
	},

	/* Marks all notifications that belong to the post thats being viewed as read. */
	'Notification.readPost': function(postId) {
		check(postId, String);
		if(this.userId) {
			Notifications.update({userId: this.userId, 'route.name': 'postPage', 'route.parameters._id': postId, read: false}, {$set: {read: true}}, {multi: true});
		}
	},
});
