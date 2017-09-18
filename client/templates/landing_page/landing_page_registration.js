Template.landingPageRegistration.onCreated(function() {
	this.errors = new ReactiveVar({});
});

Template.landingPageRegistration.helpers({

});

Template.landingPageRegistration.events({
	'submit form': function(e, template) {
		e.preventDefault();
		var username = $(e.target).find("[name=username-reg]").val().trim();
		var email = $(e.target).find("[name=email-reg]").val().trim();
		var password = $(e.target).find("[name=password-reg]").val().trim();
		var user = {email: email, username: username, password: password};

		var errors = RegistrationSchema.validate(user, {email: "Please enter a valid email address.", username: "Please enter a username betweem 3 and 12 characters.", password: "Your password must have at least 6 characters."});

		template.errors.set(errors);
		if(Object.keys(errors).length > 0) {
			return;
		}

		Accounts.createUser(user, function(error) {
			if(error) {
				switch(error.reason) {
					case "Username already exists.":
						template.errors.set({username: error.reason});
						break;
					case "Email already exists.":
						template.errors.set({email: error.reason});
						break;					
					default:
						template.errors.set({registration: 'There has been an error with your registration. Please contact support.'});
				}
			} else {
				Meteor.call('User.sendVerificationEmail', function(error, reponse) {
					if(error) {
						return throwError(error);
					}
				});
			}
		});
		return false;
	},
});