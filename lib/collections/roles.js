var hierarchy = ['member', 'moderator', 'admin'];

_.extend(Roles, {
	/** Returns true if the role exists. */
	exists: function(role) {
		check(rolename, String);
		return !!Meteor.roles.findOne({name: rolename});
	},
	/** Returns a set of roles that are below given roles in the hierarchy. */
	expandHierarchy: function(roles) {
		let result = [];
		_.each(roles, function(role) {
			result.push(hierarchy.slice(0, hierarchy.indexOf(role) + 1));
		});
		return _.uniq(_.flatten(result));
	},
	/** Returns a sorted array of given roles. */
	sortHierarchy: function(roles) {
		check(roles, [String]);
		return roles.sort(function(lhs, rhs) {
			return hierarchy.indexOf(lhs) - hierarchy.indexOf(rhs);
		});
	},
});