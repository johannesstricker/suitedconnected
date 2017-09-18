Comment = function(doc) {
	_.extend(this, doc);
};
_.extend(Comment.prototype, {
	/** returns the post this comment belongs to. */
	findPost: function() {
		return Posts.findOne(this.postId);
	},
	/** returns true if the user is allowed to edit this post. */
	canEdit: function() {
		let groupId = !!this.findPost().groupId ? this.findPost().groupId : 'public';
		let isModerator = Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator'], groupId);
		let isMember = Roles.userIsInRole(Meteor.userId(), ['member'], groupId);
		let isOwner = Meteor.userId() === this.userId;
		return isModerator || (isMember && isOwner);
	},
	/** returns true if the user is allowed to delete this post. */
	canDelete: function() {
		let groupId = !!this.findPost().groupId ? this.findPost().groupId : 'public';
		let isModerator = Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator'], groupId);
		return isModerator;		
	},
	/** Returns true if the user is allowed to upvote this comment. **/
	canUpvote: function() {
		let isNotOwner = this.userId !== Meteor.userId();
		let hasNotVoted = this.upvoters.indexOf(Meteor.userId()) === -1;
		let post = Posts.findOne(this.postId);
		let hasRightToVote = post && Roles.userIsInRole(Meteor.userId(), ['admin', 'moderator', 'member'], post.groupId);
		return !!Meteor.userId() && isNotOwner && hasNotVoted && hasRightToVote;
	},
	/** returns the comments author **/
	findAuthor: function() {
		return Meteor.users.findOne({_id: this.userId});
	},
	/** returns the thumbnail of the comments author. **/
	findThumbnail: function() {
		return Thumbnails.findOne({'meta.userId': this.userId});
	},
	/** returns a link to the thumbnail of this post. **/
	thumbnail: function(size) {
		let thumb = Thumbnails.findOne({'meta.userId': this.userId}, {sort: {uploadedAt: -1}});
		return thumb ? thumb.url({store: size, uploading: '/img/icons/loading.gif', storing: '/img/icons/loading.gif'}) : '';
	},
});

Comments = new Mongo.Collection('comments', {
	transform: function(doc) {
		return new Comment(doc);
	},
});

