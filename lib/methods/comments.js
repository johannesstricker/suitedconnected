const cheerio = Meteor.isServer ? require('cheerio') : null;

Meteor.methods({
	/** Creates a new comment and sends a notification to the post author. */
	'Comment.create': function(comment) {
		check(Meteor.userId(), String);
		check(comment, CommentsSchema.pick(['body', 'postId']));

		/* Check permissions. */
		let post = findOrThrow(comment.postId, Posts);
		if(!post.canComment()) {
			throw new Meteor.Error(403, 'You are not allowed to comment on this post.');
		}
		comment._id = Comments.mutate.create(comment);

		/* Create notification for post owner. */
		if(Meteor.isServer && post.userId !== Meteor.userId()) {
			let notification = {
				userId: post.userId,
				route: {name: 'postPage', parameters: {_id: post._id}},
				message: Meteor.user().username + " has commented on your post \'" + post.title + "\'.",
			};
			Notifications.insert(notification);
		}

		/* Parse content, and create mention-notifications. */
		if(Meteor.isServer && comment._id) {
			$ = cheerio.load(comment.body);
			let mentionedIds = [];
			let $mentions = $('a.js-mention');
			$mentions.each(function(i, mentionId) {
				mentionedIds.push($(this).attr('data-id'));
			});
			mentionedIds = _.uniq(mentionedIds);
			_.each(mentionedIds, function(mentionedId) {
				Notifications.mutate.createCommentMention(comment, mentionedId);
			});
		}

		return {commentId: comment._id};
	},
	/** Upvotes a comment with the currently logged user. **/
	'Comment.upvote': function(commentId) {
		check(Meteor.userId(), String);
		check(commentId, String);

		/* Check permissions. */
		let comment = findOrThrow(commentId, Comments);
		if(!comment.canUpvote()) {
			throw new Meteor.Error(403, 'You are not allowed to upvote this comment.');
		}

		Comments.mutate.upvote(commentId, Meteor.userId());
		return {_id: commentId};
	},
	/** Removes the comment. **/
	'Comment.delete': function(commentId) {
		check(Meteor.userId(), String);
		check(commentId, String);

		/* Check permissions. */
		let comment = findOrThrow(commentId, Comments);
		if(!comment.canDelete()) {
			throw new Meteor.Error(403, 'You are not allowed to delete this comment.');
		}

		Comments.mutate.remove(commentId);
	},
	/** Removes the comment. **/
	'Comment.edit': function(commentId, body) {
		check(Meteor.userId(), String);
		check(commentId, String);
		check(body, String);

		/* Check permissions. */
		let comment = findOrThrow(commentId, Comments);
		if(!comment.canEdit()) {
			throw new Meteor.Error(403, 'You are not allowed to edit this comment.');
		}

		return Comments.mutate.edit(commentId, {body: body});
	},
});