PUBLIC_GROUP = 'public';

Post = function(doc) {
	_.extend(this, doc);
};
_.extend(Post.prototype, {
	/** returns true if the current user is allowed to edit this post. */
	canEdit: function() {
		let groupId = !!this.groupId ? this.groupId : PUBLIC_GROUP;
		let isModerator = Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator'], groupId);
		let isOwner = Meteor.userId() === this.userId;
		return isModerator || isOwner;
	},
	/** returns true if the current user is allowed to delete this post. */
	canDelete: function() {
		let groupId = !!this.groupId ? this.groupId : PUBLIC_GROUP;
		let isModerator = Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator'], groupId);
		let isOwner = Meteor.userId() === this.userId;
		return isModerator || (isOwner && this.commentCount === 0);
	},
	/** returns true if the current user is allowed to upvote this post. */
	canUpvote: function() {
		let isNotOwner = this.userId !== Meteor.userId();
		let hasNotVoted = this.upvoters && this.upvoters.indexOf(Meteor.userId()) === -1;
		let hasRightToVote = Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator', 'member'], this.groupId);
		return !!Meteor.userId() && isNotOwner && hasNotVoted && hasRightToVote;
	},
	/** returns true if the user is allowed to create a sharable link to the post. **/
	canShare: function() {
		return this.userId === Meteor.userId();
	},
	/** returns all comments belonging to this post */
	findComments: function() {
		return Comments.find({postId: this._id}, {sort: {submitted: 1, _id: -1}});
	},
	/** returns true if this was posted in a private group. */
	isPrivate: function() {
		return !!this.groupId && this.groupId !== PUBLIC_GROUP;
	},
	/** returns true if this was NOT posted in a private group. */
	isPublic: function() {
		return !this.groupId || this.groupId === PUBLIC_GROUP;
	},
	/** returns the group this was posted in. 'null' if this is public. */
	findGroup: function() {
		return Groups.findOne({_id: this.groupId});
	},
	/** returns the tags associated to this post */
	findTags: function() {
		return Tags.find({_id: {$in: this.tagIds}});
	},
	/** returns true if the current user is allowed to comment on this post. */
	canComment: function() {
		return !!Meteor.userId() && this.isPublic() || Roles.userIsInRole(Meteor.userId(), 'member', this.groupId);
	},
	/** returns the posts author. **/
	findAuthor: function() {
		return Meteor.users.findOne({_id: this.userId});
	},
	/** returns a link to the thumbnail of this post. **/
	thumbnail: function(size) {
		var thumb = Thumbnails.findOne({'meta.userId': this.userId}, {sort: {uploadedAt: -1}});
		return thumb ? thumb.url({store: size, uploading: '/img/icons/loading.gif', storing: '/img/icons/loading.gif'}) : '';
	},
	lastActivityThumbnail: function(size) {
		if(this.lastActiveUserId) {
			var thumb = Thumbnails.findOne({'meta.userId': this.lastActiveUserId}, {sort: {uploadedAt: -1}});
		} else {
			var thumb = Thumbnails.findOne({'meta.userId': this.userId}, {sort: {uploadedAt: -1}});
		}
		return thumb ? thumb.url({store: size, uploading: '/img/icons/loading.gif', storing: '/img/icons/loading.gif'}) : '';		
	},
	isRead: function() {
		if(Meteor.user() && Meteor.user().readPosts) {
			return Meteor.user().readPosts[this._id] && Meteor.user().readPosts[this._id] >= this.lastActivity;
		}
		return false;
	},
	isShared: function() {
		return !!this.shared;
	},
});


Posts = new Mongo.Collection('posts', {
	transform: function(doc) {
		if(_.has(doc, 'handhistory') && doc.handhistory !== null) {
			doc.handhistory = new HandHistory(doc.handhistory);		
		}
		return new Post(doc);
	}
});
if(Meteor.isServer) {
	Meteor.startup(function() {
		Posts._ensureIndex({groupId: 1, userId:1, tagIds: 1, _id: -1});
	});	
}



var getQueryForNeighbors = function(entity, limit, query, projection) {
	let sign = limit / Math.abs(limit);
	_.each(_.keys(projection.sort), function(key) {
		projection.sort[key] = projection.sort[key] * sign;
		if(projection.sort[key] === -1) {
			query[key] = {$lte: entity[key]};
		} else if(projection.sort[key] === 1) {
			query[key] = {$gte: entity[key]};
		}			
	});
	projection.limit = Math.abs(limit);
	query._id = {$ne: entity._id};
}

_.extend(Posts, {
	/** returns the posts that come after current, filtered by options */
	findNext: function(post, query, projection) {
		getQueryForNeighbors(post, 1, query, projection);
		projection.fields = {_id: 1};
		_.each(_.keys(query), function(key) {
			projection.fields[key] = 1;
		});
		return Posts.find(query, projection);
	},
	/** returns the posts that come prior to current, filtered by options */
	findPrevious: function(post, query, projection) {
		getQueryForNeighbors(post, -1, query, projection);
		projection.fields = {_id: 1};
		_.each(_.keys(query), function(key) {
			projection.fields[key] = 1;
		});
		return Posts.find(query, projection);		
	},
});




