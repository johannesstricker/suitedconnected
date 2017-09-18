AnnouncementsSchema = new SimpleSchema({
	body: {
		type: String,
		min: 3,
		max: 140,
	},
	createdAt: {
		type: Date,
		autoValue: function() {
			if(this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}
		},		
	},
	dueDate: {
		type: Date,
		optional: true,
	},
	userId: {
		type: String,
	},
	author: {
		type: String,
	},
	groupId: {
		type: String,
		autoValue: function() {
			if(!this.isSet) {
				if(this.isInsert) {
					return PUBLIC_GROUP;
				} else if (this.isUpsert) {
					return {$setOnInsert: PUBLIC_GROUP};
				}
				return;
			}
			return this.value;
		},		
	},
});

Announcements.attachSchema(AnnouncementsSchema);