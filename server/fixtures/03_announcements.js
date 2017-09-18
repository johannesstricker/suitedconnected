Meteor.startup(function() {
	if(Meteor.settings.PRODUCTION) {
		return;
	}

	/** THIS WILL ONLY BE CALLED IN DEVELOPMENT **/
	if(Announcements.find().count() === 0) {
		let user = Meteor.users.findOne({username: "Johannes"});
		if(user) {
			for(let i = 0; i < 5; i++) {
				let announcement = {
					body: faker.lorem.sentence().substring(0, 139),
					userId: user._id,
					author: user.username,
					groupId: PUBLIC_GROUP
				};
				Announcements.mutate.create(announcement);
			}
		}

	}
})