Group = function(doc) {
	_.extend(this, doc);
};
_.extend(Group.prototype, {
	/** Returns true if the user is allowed to post in this group. */
	canPost: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.userIsInRole(userId, ['admin', 'moderator', 'member'], this._id);
	},
	/** Returns true if the user is allowed to edit this groups information. */
	canEdit: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.userIsInRole(userId, ['admin'], this._id);
	},
	/** Returns true if the user is allowed to delete this group. */
	canDelete: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.userIsInRole(userId, ['admin'], this._id);
	},
	/** Returns true if the user is allowed to invite new members. */
	canInvite: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.userIsInRole(userId, ['admin', 'moderator'], this._id);
	},
	/** Returns true if current user is allowed to kick userId. */
	canKick: function(userId) {
		return userId !== Meteor.userId() && this.isMember(userId) && Roles.userIsInRole(Meteor.userId(), ['admin'], this._id);
	},
	/** Returns all roles for the current user in this group. */
	getRoles: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.getRolesForUser(userId, this._id);
	},
	/** Returns the hierarchically highest user role. */
	getPrimaryRole: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		let roles = Roles.sortHierarchy(this.getRoles(userId));
		return roles[roles.length - 1];
	},
	/** Returns true if role matches users primary role. */
	isPrimaryRole: function(role, userId) {
		check(role, String);
		check(userId, Match.OneOf(String, undefined));
		userId = userId === undefined ? Meteor.userId() : userId;
		return this.getPrimaryRole(userId) === role;
	},
	/** Returns true if userId has role in group. */
	hasRole: function(role, userId) {
		check(role, String);
		check(userId, Match.OneOf(String, undefined));
		userId = userId === undefined ? Meteor.userId() : userId;
		return Roles.userIsInRole(userId, role, this._id);
	},
	/** Returns all roles current user is allowed to promote userId to. */
	canPromoteTo: function(userId)
	{
		if(userId == Meteor.userId())
			return false;
		// TODO: generalize with roles hierarchy
		let isMember = this.members.indexOf(userId) > -1;
		let isAdmin = this.getRoles().indexOf('admin') >= 0;
		// let otherIsAdmin = this.getRoles(userId).indexOf('admin') >= 0;
		if(isMember && isAdmin) {
			return ['admin', 'moderator', 'member'];
		}
		return [];
	},
	canPromoteMemberToRole: function(userId, role) {
		return this.canPromoteTo(userId).indexOf(role) > -1;
	},
	/** Returns true if the user with userId is invited to the group. If no userId is given,
	the function will check against the current user. */
	isInvited: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return _.indexOf(this.invitations, userId) > -1;
	},
	/** Returns true if the user with userId is a member of the group. If no userId is given,
	the function will check against the current user. */
	isMember: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		return _.indexOf(this.members, userId) > -1;
	},
	/** Returns true if the current user is allowed to join the group. */
	canJoin: function() {
		return this.isInvited();
	},
	/** Returns true if the current user is allowed to leave. He may not leave if he is the last admin left. */
	canLeave: function() {
		/* Check if user is admin. */
		if(!Roles.userIsInRole(Meteor.userId(), ['admin'], this._id)) {
			return true;
		}
		/* Check if there are any other admins left. */
		let admins = this.findOnlyAdmins();
		return admins.count() > 1;
	},
	/** Returns all members of the group. */
	findMembers: function() {
		return Meteor.users.find({_id: {$in: this.members}}, {fields: {_id: 1, username: 1}});
	},
	/** Returns all invited users of the group. */
	findInvitations: function() {
		return Meteor.users.find({_id: {$in: this.invitations}}, {fields: {_id: 1, username: 1}});
	},
	findOnlyAdmins: function() {
		let id = this._id;
		let adminIds = _.filter(this.members, function(member) {
			return Roles.userIsInRole(member, ['admin'], id);
		});
		return Meteor.users.find({_id: {$in: adminIds}});
	},
	findOnlyModerators: function() {
		let id = this._id;
		let moderatorIds = _.filter(this.members, function(member) {
			return Roles.userIsInRole(member, ['moderator'], id) && !Roles.userIsInRole(member, ['admin'], id);
		});
		return Meteor.users.find({_id: {$in: moderatorIds}});
	},
	findOnlyMembers: function() {
		let id = this._id;
		let memberIds = _.filter(this.members, function(member) {
			return Roles.userIsInRole(member, ['member'], id) && !Roles.userIsInRole(member, ['admin', 'moderator'], id);
		});
		return Meteor.users.find({_id: {$in: memberIds}});
	},
	findThumbnail: function() {
		let thumb = Thumbnails.findOne({'meta.groupId': this._id}, {sort: {uploadedAt: -1}});
		return !!thumb ? thumb : {url: function() { return ''; }};
	},
	/** returns a link to the thumbnail of this post. **/
	thumbnail: function(size) {
		let thumb = Thumbnails.findOne({'meta.groupId': this._id}, {sort: {uploadedAt: -1}});
		return thumb ? thumb.url({store: size, uploading: '/img/icons/loading.gif', storing: '/img/icons/loading.gif'}) : '';
	},
});

Groups = new Mongo.Collection('groups', {
	transform: function(doc) {
		return new Group(doc);
	},
});

