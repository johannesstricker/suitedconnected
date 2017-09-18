Meteor.methods({
	/** Create a new group with current user as admin. */
	'Group.create': function(groupAttributes) {
		check(Meteor.userId(), String);
		check(groupAttributes, GroupsSchema.pick(['name', 'info']));

		/** Check that no group with the same name already exists. **/
		let group = Groups.findOne({name: groupAttributes.name});
		if(group) {
			throw new Meteor.Error(403, 'A group with this name already exists.');
		}

		return { groupId: Groups.mutate.create(groupAttributes) };
	},
	/** Edit the group. */
	'Group.edit': function(groupId, groupAttributes) {
		check(Meteor.userId(), String);
		check(groupId, String);
		check(groupAttributes, GroupsSchema.pick(['info']));

		/** Check if the user is allowed to edit this group. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canEdit()) {
			throw new Meteor.Error(403, 'You are not allowed to edit this group.');
		}

		Groups.mutate.edit(groupId, groupAttributes);
		return {groupId: groupId};
	},
	/** Delete the group. */
	'Group.delete': function(groupId) {
		check(groupId, String);

		/** Check if the user is allowed to delete the group. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canDelete()) {
			throw new Meteor.Error(403, 'You are not allowed to delete this group.');
		}

		if(Groups.mutate.remove({_id: groupId})) {
			/** Create notification for all user members. **/
			_.each(group.members, function(member) {
				if(member !== Meteor.userId()) {
					let notification = {
						userId: member,
						message: "The group '" + group.name + "' has been deleted by " + Meteor.user().username + ".",
					};
					Notifications.insert(notification);
				}
			});
		}
	},
	/** Kicks a member from the group. */
	'Group.kick': function(groupId, userId) {
		check(Meteor.userId(), String);
		check(groupId, String);
		check(userId, String);

		/** Check permissions. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canKick()) {
			throw new Meteor.Error(403, 'You are not allowed to remove members from a group.');
		}

		/** Create notifications for remaining members. */
		let oldMember = findOrThrow(userId, Meteor.users);
		if(Meteor.isServer) {
			let remainingMembers = _.without(group.members, userId, Meteor.userId());
			_.each(remainingMembers, function(memberId) {
				Notifications.insert({
					userId: memberId,
					message: oldMember.username + " has been kicked from " + group.name + ".",
					route: {name: 'profile', parameters: {_id: oldMember._id}},
				});
			});

			Notifications.insert({
				userId: userId,
				message: 'You have been kicked from ' + group.name + ".",
			});
		}

		Groups.mutate.removeMember(groupId, userId);
	},
	/** Invites one or multiple users to the group. */
	'Group.invite': function(groupId, userId) {
		check(Meteor.userId(), String);
		check(groupId, String);
		check(userId, Match.OneOf(String, [String]));

		/** Check if user is allowed to invite members. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canInvite()) {
			throw new Meteor.Error(403, 'You are not allowed to remove members from a group.');
		}

		let userIds = (typeof userId === 'string' || userId instanceof String) ? [userId] : userId;

		_.each(userIds, function(uId) {
			/** Check that user exists. */
			let user = findOrThrow(uId, Meteor.users);
			/** Check that the user is not already a member of the group. */
			if(group.isMember(uId) || group.isInvited(uId)) {
				throw new Meteor.Error(403, 'You cannot invite a user who already is a member or invited to your group.');
			}

			/* Create notifications. */
			if(Meteor.isServer) {
				/* For invited user. */
				let notification = {
					userId: uId,
					message: "You have been invited to join " + group.name + ".",
					route: {name: 'groupJoin', parameters: {_id: groupId}},
				};
				Notifications.insert(notification);
				/* For group members. */
				_.each(_.without(group.members, Meteor.userId()), function(memberId) {
					Notifications.insert({
						userId: memberId,
						message: user.username + " has been invited to join " + group.name + ".",
						route: {name: 'profile', parameters: {_id: uId}},

					});
				});
			}
			Groups.mutate.inviteMember(groupId, uId);
		});
	},
	/** Cancels the invitation for a group and user. */
	'Group.uninvite': function(groupId, userId) {
		check(Meteor.userId(), String);
		check(groupId, String);
		check(userId, String);

		/** Check permissions. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canInvite()) {
			throw new Meteor.Error(403, 'You are not allowed to cancel invitations to the group.');
		}
		if(group.isMember(userId) || !group.isInvited(userId)) {
			throw new Meteor.Error(403, 'This user is not invited to the group.');
		}

		/* Create notification for the disinvited user. */
		if(Meteor.isServer) {
			let notification = {
				userId: userId,
				message: "Your invitation to " + group.name + " has been cancelled.",
			};
			Notifications.insert(notification);
		}

		Groups.mutate.removeMember(groupId, userId);
	},
	/** Declines a group invitation. */
	'Group.decline': function(groupId) {
		check(Meteor.userId(), String);
		check(groupId, String);

		/* Check if user is invited. */
		let group = findOrThrow(groupId, Groups);
		if(!group.isInvited()) {
			throw new Meteor.Error(403, 'You are not invited to this group.');
		}

		/* Create notification for all members of the group. */
		if(Meteor.isServer) {
			_.each(group.members, function(memberId) {
				Notifications.insert({
					userId: memberId,
					message: Meteor.user().username + " has declined the invitation to " + group.name + ".",
					route: {name: 'groupEdit', parameters: {_id: groupId}},
				});
			});
		}

		Groups.mutate.removeMember(groupId, Meteor.userId());
	},
	/** Joins the group. */
	'Group.join': function(groupId) {
		check(Meteor.userId(), String);
		check(groupId, String);

		/* Check permissions. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canJoin()) {
			throw new Meteor.Error(403, 'You are not allowed to join this group.');
		}
		Groups.mutate.addMember(groupId, Meteor.userId());

		/* Create notification for all members of the group. */
		if(Meteor.isServer) {
			let otherMembers = _.without(group.members, Meteor.userId());
			_.each(otherMembers, function(memberId) {
				Notifications.insert({
					userId: memberId,
					message: Meteor.user().username + " has accepted the invitation to " + group.name + ".",
					route: {name: 'groupEdit', parameters: {_id: group._id}},
				});
			});
		}

		return {groupId: groupId};
	},
	/** Leaves the group. */
	'Group.leave': function(groupId) {
		check(Meteor.userId(), String);
		check(groupId, String);

		/* Check permissions. */
		let group = findOrThrow(groupId, Groups);
		if(!group.canLeave()) {
			throw new Meteor.Error(403, 'You are not allowed to leave the group as the last admin left. Please promote a member or delete the group instead.');
		}

		/* Create notification for all members of the group. */
		if(Meteor.isServer) {
			let otherMembers = _.without(group.members, Meteor.userId());
			_.each(otherMembers, function(memberId) {
				Notifications.insert({
					userId: memberId,
					message: Meteor.user().username + " has left " + group.name + ".",
					route: {name: 'groupEdit', parameters: {_id: group._id}},
				});
			});
		}

		Groups.mutate.removeMember(groupId, Meteor.userId());
	},
	/** Promotes a user to role. */
	'Group.promoteMember': function(groupId, userId, roles) {
		check(Meteor.userId(), String);
		check(groupId, String);
		check(userId, String);
		check(roles, [String]);

		roles = Roles.expandHierarchy(roles);
		if(roles.length === 0) {
			throw new Meteor.Error(500, 'You cannot promote a member to `undefined`.');
		}

		/* Check permissions. */
		let group = findOrThrow(groupId, Groups);
		let possiblePromotions = group.canPromoteTo(userId);

		if(!_.intersection(possiblePromotions, roles).sort().equals(roles.sort())) {
			throw new Meteor.Error(403, 'You are not allowed to make this promotion.');
		}
		Roles.setUserRoles(userId, roles, groupId);
	}
});