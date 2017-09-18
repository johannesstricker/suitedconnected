Migrations.add({
	version: 1,
	name: "Changed PostSchema to include views, chipsSpent, lastActiveUser, lastActiveUserId",
	up: function() {
		let posts = Posts.find().forEach(function(post) {
			let comments = Comments.find({postId: post._id}, {sort: {submitted: -1}}).fetch();

			/** Update accumulated chips. **/
			let voteArray = _.pluck(comments, 'votes');
			let voteSum = _.reduce(voteArray, function(memo, num) { return memo+num; }, 0) + post.votes;
			let update = {$set: {views: 0, chipsSpent: voteSum}};

			/* Update user on lastActivity **/
			let lastActivity = comments.length ? comments[0] : post;			
			if(comments.length > 0) {
				update.$set.lastActiveUser = lastActivity.author;
				update.$set.lastActiveUserId = lastActivity.userId;
			}

			Posts.update({_id: post._id}, update);
		});
	},
	down: function() {
		Posts.update({}, {$unset: {views: "", chipsSpent: "", lastActiveUser: "", lastActiveUserId: ""}});
	},
});

Meteor.startup(function() {
	Migrations.migrateTo('latest');
});