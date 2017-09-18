Notification = function(doc) {
	return _.extend(this, doc);
};
_.extend(Notification.prototype, {
	/** If a route is defined on the notification, it will be visited. */
	visit: function() {
		if(this.route) {
			let query = this.route.parameters && this.route.parameters.hash ? {hash: this.route.parameters.hash} : {};
			Router.go(this.route.name, this.route.parameters || {}, query);
		}
	},
});

Notifications = new Mongo.Collection('notifications', {
	transform: function(doc) {
		return new Notification(doc);
	},
});
