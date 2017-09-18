/** Publication schemas. **/
let inArraySchema = new SimpleSchema({
	$in: {
		type: [String]
	},
});
let allArraySchema = new SimpleSchema({
	$all: {
		type: [String]
	},
});
let postQuerySchema = new SimpleSchema({
	groupId: {
		type: inArraySchema,
		optional: true,
	},
	tagIds: {
		type: allArraySchema,
		optional: true,
	},
	userId: {
		type: inArraySchema,
		optional: true,
	},
});
let postProjectionSchema = new SimpleSchema({
	sort: {
		type: Object,
		optional: true,
		blackbox: true,
	},
	limit: {
		type: Number,
		optional: true,
	},
});
let limitGroupsToUser = function(userId, query) {
	if(query.groupId) {
		let userGroups = _.union(Roles.getGroupsForUser(userId), [PUBLIC_GROUP]);
		query.groupId.$in = _.intersection(userGroups, query.groupId.$in);
	}
};

/** Publishes multiple posts, matching the options. */
Meteor.publishComposite('Post.list', function(query, projection){
	return {
		find: function() {
			check(query, postQuerySchema);
			check(projection, postProjectionSchema);
			limitGroupsToUser(this.userId, query);
			projection.fields = {body: 0};
			return Posts.find(query, projection);
		},
		children: [
			{
				find: function(post) {
					return Thumbnails.find({'meta.userId': post.userId});
				},
			}
		]
	};
});

/** Publishes a single post together with all of its comments. */
Meteor.publishComposite('Post.single', function(id) {
	return {
		find: function() {
			check(id, String);
			let userGroups = _.union(this.userId ? Roles.getGroupsForUser(this.userId) : [], [PUBLIC_GROUP]);
			return Posts.find({_id: id, groupId: {$in: userGroups}});
		},
		children: [
			{
				find: function(post) {
					return Comments.find({postId: post._id});
				},
				children: [
					{
						find: function(comment) {
							return Thumbnails.find({'meta.userId': comment.userId});
						}
					}
				]
			},
			{
				find: function(post) {
					return Thumbnails.find({'meta.userId': post.userId});
				}
			}
		]
	};
});

Meteor.publishComposite('Post.shared', function(postId) {
	return {
		find: function() {
			check(postId, String);
			return Posts.find({_id: postId, shared: true});
		},
		children: [
			{
				find: function(post) {
					return Thumbnails.find({'meta.userId': post.userId});
				},
			},
		],
	};
});


Meteor.publish('Post.next', function(post, query, projection) {
	check(post, Object);
	check(query, Object);
	check(projection, Object);
	return Posts.findNext(post, query, projection);
});
Meteor.publish('Post.previous', function(post, query, projection) {
	check(post, Object);
	check(query, Object);
	check(projection, Object);
	return Posts.findPrevious(post, query, projection);
});






