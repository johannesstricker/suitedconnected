Meteor.publish('User.thumbnail', function(userId) {
	check(userId, String);
	return Thumbnails.find({'meta.userId': userId});
});

Meteor.publish('User.readPosts', function() {
	return Meteor.users.find({_id: this.userId}, {fields: {readPosts: 1}});
});

Meteor.publishComposite('User.search', function(like, limit = null) {
	return {
		find: function() {
			check(like, String);
			check(limit, Match.OneOf(null, Number));
			let projection = {fields: {_id: 1, username: 1}, sort: {username: 1}};
			if(limit) {
				projection.limit = limit;
			}
			return Meteor.users.find({username: {$regex: '^' + like, $options: 'i'}}, projection);
		},
		children: [
			{
				find: function(user) {
					return Thumbnails.find({'meta.userId': user._id});
				}
			}
		]
	};
});

Meteor.publish('User.byUsername', function(usernames) {
	check(usernames, [String]);
	return Meteor.users.find({username: {$in: usernames}}, {fields: {username: 1, _id: 1}});
});

Meteor.publishComposite('User.single', function(userId) {
	return {
		find: function() {
			check(userId, String);
			return Meteor.users.find({_id: userId}, {fields: {_id: 1, username: 1, 'profile.bio': 1, stats: 1, createdAt: 1}});
		},
		children: [
			{
				find: function(user) {
					return Thumbnails.find({'meta.userId': user._id});
				}
			}
		]
	};
});