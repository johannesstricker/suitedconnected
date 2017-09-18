var PostStatsSchema = new SimpleSchema({
	chipsSpent: {
		type: Number,
		min: 0,
		defaultValue: 0,
	},
	views: {
		type: Number,
		min: 0,
		defaultValue: 0,
	},

});

PostsSchema = new SimpleSchema({
	_id: {
		type: String,
		optional: true
	},
	title: {
		type: String,
		label: "Post title",
		min: 3,
		max: 100,
	},
	body: {
		type: String,
		label: "Post",
		min: 3
	},
	handhistory: {
		type: Object,
		blackbox: true,
		optional: true,
	},
	userId: {
		type: String,
		label: "User Id"
	},
	author: {
		type: String,
		label: "Post author"
	},
	submitted: {
		type: Date,
		label: "Submitted",
		autoValue: function() {
			if(this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}
		}
	},
	lastUpdate: {
		type: Date,
		label: "Last update",
		optional: true,
		autoValue: function() {
			var body = this.field("body");
			var title = this.field("title");
			if(body.isSet || title.isSet) {
				if(this.isUpsert) {
					return {$setOnUpdate: new Date()};
				} else if (this.isUpdate) {
					return new Date();
				}
			}
			this.unset();
		}
	},
	lastActivity: {
		type: Date,
		label: "Last activity",
		autoValue: function() {
			var commentCount = this.field("commentCount");
			if(this.isInsert || commentCount.isSet) {
				return new Date();
			}
			if(this.isUpsert) {
				return {$setOnInsert: new Date()};
			}
			this.unset();
		}
	},
	votes: {
		type: Number,
		label: "Number of votes",
		defaultValue: 0,
		min: 0
	},
	upvoters: {
		type: [String],
		label: "Voter Ids",
		autoValue: function() {
			if(this.isInsert) {
				return [];
			} else if (this.isUpsert) {
				return {$setOnInsert: []};
			}
		}
	},
	tagIds: {
		type: [String],
		label: "Tag Ids",
		minCount: 1,
		maxCount: 5
	},
	groupId: {
		type: String,
		label: "Group Id",
		optional: true,
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
	commentCount: {
		type: Number,
		label: "Comment count",
		defaultValue: 0,
		min: 0
	},
	views: {
		type: Number,
		defaultValue: 0,
		min: 0,
	},
	chipsSpent: {
		type: Number,
		defaultValue: 0,
		min: 0,
	},
	lastActiveUser: {
		type: String,
		optional: true,
	},
	lastActiveUserId: {
		type: String,
		optional: true,	
	},
	shared: {
		type: Boolean,
		optional: true,
		defaultValue: false,
	},
});

Posts.attachSchema(PostsSchema);
