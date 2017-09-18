const cheerio = Meteor.isServer ? require('cheerio') : null;

Meteor.methods({
	/** Creates a new post*/
	'Post.create': function(post) {
		check(Meteor.userId(), String);
		check(post, PostsSchema.pick(['title', 'body', 'tagIds', 'tagIds.$', 'handhistory', 'groupId']));

		/* Check if user is member of this group. */
		if(post.groupId) {
			var group = findOrThrow(post.groupId, Groups);
			if(!group.canPost()) {
				throw new Meteor.Error(403, 'You are not allowed to post in this group.');
			}
		}

		post._id = Posts.mutate.create(post);

		/* Parse post content, and create mention-notifications. */
		if(Meteor.isServer && post._id) {
			$ = cheerio.load(post.body);
			let mentionedIds = [];
			let $mentions = $('a.js-mention');
			$mentions.each(function(i, mentionId) {
				mentionedIds.push($(this).attr('data-id'));
			});
			mentionedIds = _.uniq(mentionedIds);
			_.each(mentionedIds, function(mentionedId) {
				Notifications.mutate.createPostMention(post, mentionedId);
			});
		}

		return {_id: post._id};
	},
	/** Upvotes the post. */
	'Post.upvote': function(postId) {
		check(Meteor.userId(), String);
		check(postId, String);

		/* Check permissions. */
		let post = findOrThrow(postId, Posts);
		if(!post.canUpvote()) {
			throw new Meteor.Error(403, 'You are not allowed to upvote this post.');
		}

		Posts.mutate.upvote(postId, Meteor.userId());
		return {_id: postId};
	},
	/** Edits the post. */
	'Post.edit': function(postId, postAttributes) {
		check(Meteor.userId(), String);
		check(postId,  String);
		check(postAttributes, PostsSchema.pick(['title', 'body', 'tagIds', 'tagIds.$', 'handhistory']));

		/* Check that the user is allowed to update. */
		let post = findOrThrow(postId, Posts);
		if(!post.canEdit()) {
			throw new Meteor.Error(403, 'You are not allowed to update this post.');
		}

		/* Check that no handhistory is completely removed or added. */
		if((!post.handhistory && !!postAttributes.handhistory)
			|| (!!post.handhistory && !postAttributes.handhistory)) {
			throw new Meteor.Error(403, 'You are not allowed to remove or add a handhistory when editing a post.');
		}

		/* Validate input. */
		let errors = PostsSchema.validate(postAttributes, {title: 'Please enter a title.', body: 'Please enter a post.', tags: 'Please select between one and five tags.'});
		if(Object.keys(errors).length > 0) {
			throw new Meteor.Error('invalid-post', 'You must set a title, a body and at least one tag for your post.');
		}

		Posts.mutate.edit(postId, postAttributes);
		return {_id: postId};
	},
	/** Delete the post. */
	'Post.delete': function(postId) {
		check(postId, String);

		/* Check that the user is allowed to delete this post. */
		let post = findOrThrow(postId, Posts);
		if(!post.canDelete()) {
			throw new Meteor.Error(403, 'You are not allowed to delete this post.');
		}

		return Posts.mutate.remove(postId);
	},
	'Post.view': function(postId) {
		check(postId, String);

		/** Mark this post as read. */
		let userId = Meteor.userId();
		if(userId) {
			Meteor.users.mutate.readPost(userId, postId);
		}

		// TODO: check if views should be updated
		return Posts.mutate.increaseViews(postId, 1);
	},
	'Post.share': function(postId, share) {
		check(Meteor.userId(), String);
		check(postId, String);
		check(share, Boolean);

		let post = findOrThrow(postId, Posts);
		if(!post.canShare()) {
			throw new Meteor.Error(403, 'You are not allowed to share this post.');
		}

		return Posts.mutate.share(postId, share);
	},
});