CommentsSchema = new SimpleSchema({
	_id: {
		type: String,
		optional: true
	},
	body: {
		type: String,
		label: "Comment",
		min: 1
	},
	postId: {
		type: String,
		label: "Post Id"
	},
	userId: {
		type: String,
		label: "User Id"
	},
	author: {
		type: String,
		label: "Author"
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
});

Comments.attachSchema(CommentsSchema);