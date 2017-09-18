Meteor.methods({
	'User.editInfo': function(userId, info) {
		check(Meteor.userId(), String);
		check(userId, String);
		check(info, String);

		let user = findOrThrow(userId, Meteor.users);
		if(!user.canEdit()) {
			throw new Meteor.Error(403, 'You are not allowed to edit this profile.');
		}
		Meteor.users.mutate.editInfo(userId, info);
	},
	'User.sendVerificationEmail': function() {
		check(Meteor.userId(), String);
		if(Meteor.isServer) {
			return Accounts.sendVerificationEmail(Meteor.userId());
		}
	},
	'User.sendPasswordReset': function(email) {
		check(email, String);		
		if(Meteor.isServer) {
			let user = Accounts.findUserByEmail(email);
			if(!user) {
				throw new Meteor.Error(403, 'User not found.');
			}
			return Accounts.sendResetPasswordEmail(user._id);
		}
	},
	'User.changePassword': function(password, confirmation) {
		check(password, String);
		check(confirmation, String);

		/** Validation **/
		if(password !== confirmation) {
			throw new Meteor.Error(403, 'Password confirmation does not match.');
		}
		if(!RegistrationSchema.validateValue(password, 'password')) {
			throw new Meteor.Error(403, 'Password does not meet requirements.');
		}

		if(Meteor.isServer) {
			return Accounts.setPassword(Meteor.userId(), password, {logout: false});
		}
	}
});