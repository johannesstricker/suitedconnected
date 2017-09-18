/** Increases/Decreases the postCount/handCount for the posts group and user. **/
var updatePostCount = function(post, num) {
	let isHandhistory = !!post.handhistory;
	let isPrivate = post.groupId !== PUBLIC_GROUP;

	let field = isHandhistory ? 'stats.handCount' : 'stats.postCount';
	/* Create query */
	let query = {$inc: {}};
	query['$inc'][field] = num;

	if(isPrivate) { // right now we dont have public stats
		Groups.update({_id: post.groupId}, query);
	}
	Meteor.users.update({_id: post.userId}, query);
}
var updateUserTags = function(post, num) {
	let tags = _.object(_.map(post.tagIds, function(tagId) {
		return ['stats.tags.' + tagId, num];
	}));
	let query = {$inc: tags};
	Meteor.users.update({_id: post.userId}, query);
};

Posts.mutate = {
	/** Inserts a new post into the database. */	
	create: function(post) {
		/* Add user to the post. */
		post = _.defaults(post, {
			userId: tryUserId(),
			author: tryUserName(),
			groupId: PUBLIC_GROUP,
		});
		/* Insert */
		let result = Posts.insert(post);
		/* Update postCount. */
		if(result) {
			updatePostCount(post, 1);
			updateUserTags(post, 1);			
		}
		return result;
	},
	/** Edits the post with _id. */
	edit: function(_id, post) {
		// TODO: check allowed fields
		return Posts.update(_id, {$set: post});
	},
	/** Removes the post with _id. */
	remove: function(selector) {
		/* Decrease post count. */
		let affectedPosts = Posts.find(selector).fetch();
		_.each(affectedPosts, function(post) {
			updatePostCount(post, -1);
			updateUserTags(post, -1);	
			Comments.mutate.remove({postId: post._id});			
		});
		return Posts.remove(selector);
	},
	/** Upvotes a post and adds to the chipcount of the author.
	*	Does not prevent multiple upvotes by the same user. **/
	upvote: function(postId, voterId) {
		check(postId, String);
		check(voterId, String);

		/* Add vote to the post. */
		let affectedPosts = Posts.update({_id: postId,}, {
			$addToSet: {upvoters: voterId},
			$inc: {votes: 1, chipsSpent: 1}
		});
		/* If the update was successful, add to the stack of the author. */
		if(affectedPosts) {
			let post = findOrThrow(postId, Posts);
			Meteor.users.update({_id: post.userId}, {$inc: {'stats.stack': 1}});
		}
		return affectedPosts;
	},
	increaseViews: function(postId, views) {
		check(postId, String);
		return Posts.update({_id: postId}, {$inc: {views: views}});
	},
	share: function(postId, share) {
		check(postId, String);
		check(share, Boolean);
		return Posts.update({_id: postId}, {$set: {shared: share}});
	},
}