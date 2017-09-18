Meteor.publishComposite('Group.member', {
	find: function() {
		return Groups.find({members: this.userId});			
	},
	children: [
		{
			find: function(group) {
				let users = Meteor.users.find({_id: {$in: _.union(group.members, group.invitations)}}, 
								{fields: {_id: 1, username: 1, profile: 1, roles: 1}});
				return users;
			},
			children: [
				{
					find: function(user) {
						return Thumbnails.find({'meta.userId': user._id});
					}
				}
			]
		},
		{
			find: function(group) {
				return Thumbnails.find({'meta.groupId': group._id});
			}
		},
		{
			find: function(group) {
				return Announcements.findPending(group._id);
			}
		}
	]
});

Meteor.publishComposite('Group.invited', {
	find: function() {
		return Groups.find({invitations: this.userId});			
	},
	children: [
		{
			find: function(group) {
				// [ "roles" + this._id ]: 1, [ "roles" + Roles.GLOBAL_GROUP ]: 1
				let users = Meteor.users.find({_id: {$in: _.union(group.members, group.invitations)}}, 
								{fields: {_id: 1, username: 1, profile: 1, roles: 1}});
				return users;
			},
			children: [
				{
					find: function(user) {
						return Thumbnails.find({'meta.userId': user._id});
					}
				}
			]
		},
		{
			find: function(group) {
				return Thumbnails.find({'meta.groupId': group._id});
			}
		},
		{
			find: function(group) {
				return Announcements.findPending(group._id);
			}
		}
	]
});

