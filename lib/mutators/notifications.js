Notifications.mutate = {
	createPostMention: function(post, mentionedId) {
		check(post._id, String);
		check(post.title, String);
		check(post.author, String);
		check(mentionedId, String);

		let notification = {
			userId: mentionedId,
			message: post.author + " has mentioned you in a post with the title '" + post.title + "'.",
			route: {name: 'postPage', parameters: {_id: post._id}},
		};
		return Notifications.insert(notification);
	},
	createCommentMention: function(comment, mentionedId) {
		check(comment._id, String);
		check(comment.postId, String);
		check(comment.author, String);
		check(mentionedId, String);

		let notification = {
			userId: mentionedId,
			message: comment.author + " has mentioned you in a comment.",
			route: {name: 'postPage', parameters: {_id: comment.postId, hash: 'comment-' + comment._id}},
		};
		Notifications.insert(notification);
	},
}