var GroupStatsSchema = new SimpleSchema({
	'postCount': {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
	'handCount': {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
	'commentCount': {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
});

GroupsSchema = new SimpleSchema({
	name: {
		type: String,
		label: "Group name",
		min: 3,
		max: 24,
		unique: true
	},
	info: {
		type: String,
		label: "Group information",
		defaultValue: "No information available."
	},
	createdAt: {
		type: Date,
		label: "Date of creation",
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}			
		}
	},
	members: {
		type: [String],
		label: "Members",
		minCount: 1
	},
	invitations: {
		type: [String],
		label: "Invited user's Ids",
		defaultValue: []
	},
	stats: {
		type: GroupStatsSchema,
	}
});

Groups.attachSchema(GroupsSchema);