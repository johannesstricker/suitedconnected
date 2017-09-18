NotificationsSchema = new SimpleSchema({
	userId: {
		type: String,
		label: "User Id"
	},
	message: {
		type: String,
		label: "Message"
	},
	'route.name': {
		type: String,
		label: "Route name",
	},
	'route.parameters': {
		type: Object,
		label: "Route parameters",
		optional: true,
		blackbox: true
	},
	read: {
		type: Boolean,
		label: "Read",
		optional: true,
		defaultValue: false,
	},
	date: {
		type: Date,
		label: "Date",
		optional: true,
		autoValue: function() {
			if(this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			}
		}
	}
});

Notifications.attachSchema(NotificationsSchema);