Meteor.users.mutate = {
	editInfo: function(userId, info) {
		Meteor.users.update(userId, {$set: {'profile.bio': info}});
	},
	readPost: function(userId, postId) {
		check(userId, String);
		check(postId, String);

		let projection = {$set: {}};
		projection['$set']['readPosts.' + postId] = new Date();
		return Meteor.users.update({_id: userId}, projection);
	}
}