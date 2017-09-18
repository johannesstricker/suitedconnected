UserCountrySchema = new SimpleSchema({
    name: {
        type: String
    },
    code: {
        type: String,
        regEx: /^[A-Z]{2}$/
    }
});
UserProfileSchema = new SimpleSchema({
    firstName: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    country: {
        type: UserCountrySchema,
        optional: true
    }
});

var UserStatsSchema = new SimpleSchema({
    stack: {
        type: Number,
        min: 0,
        defaultValue: 0,
    },
    postCount: {
        type: Number,
        min: 0,
        defaultValue: 0,
    },
    handCount: {
        type: Number,
        min: 0,
        defaultValue: 0,
    },
    commentCount: {
        type: Number,
        min: 0,
        defaultValue: 0,
    },
    tags: {
        type: Object,
        blackbox: true,
        optional: true,
    }
});

UsersSchema = new SimpleSchema({
    username: {
        type: String,
        min: 3,
        max: 12,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        // optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        // optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: UserProfileSchema,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    // roles: {
    //     type: [String],
    //     optional: true
    // },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    },
    stats: {
        type: UserStatsSchema,
    },
    readPosts: {
        type: Object,
        blackbox: true,
        optional: true,
    }
});

RegistrationSchema = new SimpleSchema({
	username: {
		type: String,
		min: 3,
		max: 12
	},
	email: {
		type: String,
		regEx: SimpleSchema.RegEx.Email
	},
	password: {
		type: String,
		min: 6
	}
});

UsersSchema.validateLogin = function(login) {
	var context = this.newContext();
	var errors = {};
	var keys = _.keys(attributes);
	_.each(keys, function(key) {
		var error = attributes[key];
		if(!context.validateOne(entity, key)) {
			errors[key] = error;
		}
	});
	return errors;
}
UsersSchema.validateRegistration = function(registration) {
	var context = this.newContext();
	var errors = {};
	if(!context.validateOne(registration, 'username')) {
		errors['username'] = 'Please enter a username between 3 and 12 characters.';
	}
	if(!context.validateOne(registration, 'email')) {
		errors['email'] = 'Please enter a valid email address.';
	}
	if(!context.validateOne(registration, 'password')) {
		errors['password'] = 'Please enter a password between 6 and 24 characters.';
	}
	return errors;
}

Meteor.users.attachSchema(UsersSchema);