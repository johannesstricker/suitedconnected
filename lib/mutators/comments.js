var updateCommentCount = function(comment, num) {
	let post = Posts.findOne({_id: comment.postId});
	if(!post) {
		return;
	}
	let isPrivate = post.groupId !== PUBLIC_GROUP;
	/* Create query */
	let query = {$inc: {'stats.commentCount': num}};

	Posts.update({_id: comment.postId}, {$inc: {commentCount: num}})
	if(isPrivate) { // right now we dont have public stats
		Groups.update({_id: post.groupId}, query);
	}
	Meteor.users.update({_id: comment.userId}, query);
}
var updatePostActivity = function(postId) {
	let post = Posts.findOne(postId);
	if(!post) {
		return;
	}
	let comments = Comments.find({postId: postId}, {sort: {submitted: -1}});
	if(comments.count() === 0) {
		return Posts.update({_id: post._id}, {$set: {lastActivity: post.submitted}, $unset: {lastActiveUser: "", lastActiveUserId: ""}});
	}
	let comment = comments.fetch()[0];
	return Posts.update({_id: post._id}, {$set: {lastActiveUser: comment.author, lastActiveUserId: comment.userId, lastActivity: comment.submitted}});
}

Comments.mutate = {
	create: function(comment) {
		/* Insert comment. */
		comment = _.defaults(comment, {
			userId: tryUserId(),
			author: tryUserName(),
		});
		let result = Comments.insert(comment);
		/* Update comment count. */
		if(result) {
			updateCommentCount(comment, 1);
			Posts.update({_id: comment.postId}, {$set: {lastActiveUser: comment.author, lastActiveUserId: comment.userId}});
		}
		return result;
	},
	remove: function(selector) {
		/* Decrease comment count. */
		let affectedComments = Comments.find(selector).fetch();
		_.each(affectedComments, function(comment) {
			updateCommentCount(comment, -1);
			updatePostActivity(comment.postId);					
		});
		return Comments.remove(selector);
	},
	upvote: function(commentId, voterId) {
		check(commentId, String);
		check(voterId, String);

		/* Add vote to the post. */
		let affectedComments = Comments.update({_id: commentId,}, {
			$addToSet: {upvoters: voterId},
			$inc: {votes: 1}
		});
		/* If the update was successful, add to the stack of the author. */
		if(affectedComments) {
			let comment = findOrThrow(commentId, Comments);
			Meteor.users.update({_id: comment.userId}, {$inc: {'stats.stack': 1}});
			Posts.update({_id: comment.postId}, {$inc: {chipsSpent: 1}});
		}
		return affectedComments;
	},
	/** Edits the comment with _id. */
	edit: function(commentId, comment) {
		// TODO: check allowed fields
		return Comments.update(commentId, {$set: comment});
	},
};