Meteor.publish('Notification.user', function(limit) {
	limit = limit === undefined ? 15 : limit;
	check(limit, Number);
	return Notifications.find({userId: this.userId}, {limit: limit, sort: {read: 1, date: -1}});
});

Meteor.publish('Notification.count', function() {
	Counts.publish(this, 'notifications', Notifications.find({userId: this.userId, read: false}));
});
