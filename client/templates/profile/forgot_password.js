Template.forgotPassword.onCreated(function() {
	var instance = this;
	instance.errors = new ReactiveVar({});
});

Template.forgotPassword.events({
	'submit #forgot-password-form': function(e, instance) {
		e.preventDefault();
		let email = $('#email-reset').val();
		if(!SimpleSchema.RegEx.Email.test(email)) {
			return instance.errors.set({forgotPassword: 'Please provide a valid email address.'});
		}
		instance.errors.set({});
		Meteor.call('User.sendPasswordReset', email, function(error, result) {
			if(error) {
				if(error.reason === "User not found.") {
					return instance.errors.set({forgotPassword: 'Email address not found.'});
				}
				return throwError(error.reason);
			}
			instance.data.currentTemplate.set('login');
			swal("Check your inbox", "An email with further instructions has been sent to your email address.", "success");
		});
	},
});