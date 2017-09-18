Meteor.startup(function() {
	if(Meteor.settings.PRODUCTION) {
		if(Meteor.users.find().count() === 0) {
			let johannesId = Accounts.createUser({
				email: 'johannes@suitedconnected.com',
				password: 'passwort123',
				username: 'Johannes'
			});
			Roles.addUsersToRoles(johannesId, ['admin', 'moderator', 'member'], PUBLIC_GROUP);

			let marcId = Accounts.createUser({
				email: 'marc@suitedconnected.com',
				password: 'passwort123',
				username: 'Marc'
			});
			Roles.addUsersToRoles(marcId, ['admin', 'moderator', 'member'], PUBLIC_GROUP);

			let marisId = Accounts.createUser({
				email: 'maris@suitedconnected.com',
				password: 'passwort123',
				username: 'Maris'
			});
			Roles.addUsersToRoles(marisId, ['admin', 'moderator', 'member'], PUBLIC_GROUP);
		}
		return;
	}

	/** THIS WILL ONLY BE CALLED IN DEVELOPMENT **/
	var random = function(max) {
		return Math.floor(Math.random() * max);
	};
	var randomFromCollection = function(collection) {
		var max = collection.find().count();
		return collection.findOne({}, {skip: random(max)});
	};
	var randomFromCollectionMulti = function(collection, num) {
		var max = collection.find().count();
		var ids = [];
		var result = [];
		for(let i = 0; i < num; i++) {
			let found = collection.findOne({_id: {$nin: ids}}, {skip: random(max)});
			if(found) {
				result.push(found);
				ids.push(found._id);
			}
		}
		return result;
	};
	var randomFromCollectionMultiAttribute = function(collection, num, attributes) {
		var temp = randomFromCollectionMulti(collection, num);
		var result = [];
		_.each(temp, function(item) {
			if(attributes instanceof Array) {
				result.push(_.pick(item, attributes));
			} else {
				result.push(item[attributes]);
			}
		});
		return result;
	};
	var randomFromArray = function(array) {
		let index = random(array.length - 1);
		return array[index];
	};

	if(Meteor.users.find().count() === 0 && Posts.find().count() === 0) {
		/* Create superuser */
		var superUserId = Accounts.createUser({
			email: "super@mail.com",
			password: "passwort123",
			profile: {},
			username: "superuser"
		});
		/* Assign admin to Johannes */
		Roles.addUsersToRoles(superUserId, ['admin'], Roles.GLOBAL_GROUP);

		/* Create user Johannes */
		var johannesId = Accounts.createUser({
			email: "johannes@mail.com",
			password: "passwort123",
			profile: {},
			username: "Johannes"
		});
		/* Assign admin to Johannes */
		Roles.addUsersToRoles(johannesId, ['admin'], PUBLIC_GROUP);

		/* Create Users */
		for(let i = 0; i < 15; i++) {
			let email = faker.internet.email(),
				username = faker.name.firstName(),
				isExistingUser = Meteor.users.findOne({$or: [{'emails.address': email}, {'username': username}]});

			if(!isExistingUser) {
				let userId = Accounts.createUser({
					email: email,
					password: 'passwort123',
					profile: {},
					username: username
				});
			}
		}

		let groupIdArray = [];

		/* Create groups */
		for(let i = 0; i < 10; i++) {
			var group = {
				name: faker.name.firstName() + "'s group",
				members: _.union([johannesId], randomFromCollectionMultiAttribute(Meteor.users, 9, '_id'))
			};
			let groupId = Groups.insert(group);
			groupIdArray.push(groupId);

			Roles.addUsersToRoles(johannesId, ['admin'], groupId);
			_.each(group.members, function(userId) {
				Roles.addUsersToRoles(userId, ['member'], groupId);
			});
		}

		/* Create Posts */
		for(let i = 0; i < 3000; i++) {
			var user = randomFromCollection(Meteor.users);
			var numVotes = random(Meteor.users.find().count());
			var post = {
				title: faker.lorem.sentence().substring(0, 50),
				body: faker.lorem.paragraph(),
				userId: user._id,
				author: user.username,
				submitted: faker.date.past(),
				commentCount: Math.floor(Math.random() * 6),
				votes: numVotes,
				upvoters: randomFromCollectionMultiAttribute(Meteor.users, numVotes, '_id'),
				tagIds: randomFromCollectionMultiAttribute(Tags, 3, '_id'),
			};
			/* Randomly assign a group to a third of all posts */
			if(Math.floor(Math.random() * 3) === 1) {
				post.groupId = randomFromArray(groupIdArray);
			}
			
			/* Insert post */
			var postId = Posts.insert(post);

			/* Create Comments */
			for(let j = 0; j < post.commentCount; j++) {
				var user = randomFromCollection(Meteor.users);
				var comment = {
					body: faker.lorem.paragraph(),
					userId: user._id,
					author: user.username,
					postId: postId,
					submitted: faker.date.past()
				};

				Comments.insert(comment);
			}
		}
	}
});

