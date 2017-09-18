Groups.mutate = {
	/** Creates a new group. */
	create: function(group) {
		/** Set defaults. */
		group = _.defaults(group, {
			members: [tryUserId()],
		});

		/** Add user roles. */
		let groupId = Groups.insert(group);
		_.each(group.members, function(member) {
			Roles.addUsersToRoles(member, ['admin', 'member'], groupId);
		});

		return groupId;
	},
	/** Edits the group. */
	edit: function(groupId, group) {
		return Groups.update({_id: groupId}, {$set: group});
	},
	/** Deletes the group. */
	remove: function(selector) {
		/* Deletion of roles and posts is handled in hooks. */
		return Groups.remove(selector);
	},
	/** Removes a member or invitation from the group. */
	removeMember: function(groupId, userId) {
		Roles.setUserRoles(userId, [], groupId);
		return Groups.update({_id: groupId}, {$pull: {members: userId, invitations: userId}});
	},
	/** Invites a member to the group. */
	inviteMember: function(groupId, userId) {
		return Groups.update({_id: groupId, members: {$ne: userId}}, {$addToSet: {invitations: userId}});
	},
	/** Adds a member to the group. */
	addMember: function(groupId, userId) {
		Roles.setUserRoles(userId, ['member'], groupId);
		return Groups.update({_id: groupId}, {$addToSet: {members: userId}, $pull: {invitations: userId}});
	},
}