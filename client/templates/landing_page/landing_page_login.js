Template.landingPageLogin.onCreated(function() {
	this.errors = new ReactiveVar({});
});

Template.landingPageLogin.helpers({

});

Template.landingPageLogin.events({
	'submit form': function(e, template) {
		e.preventDefault();
		var email = $(e.target).find("[name=email]").val().trim();
		var password = $(e.target).find("[name=password]").val().trim();

		var errors = RegistrationSchema.validate({email: email, username: email}, {email: 'Error', username: 'Error'});
		if(Object.keys(errors).length > 1) {
			errors = {email: "Please enter a valid email or username."};
		}
		else
		{
			errors = {};
		}
		if(password.length === 0) {
			errors.password = 'Please enter your password.';
		}
		template.errors.set(errors);
		if(Object.keys(errors).length > 0) {
			return;
		}

		Meteor.loginWithPassword(email, password, function(error) {
			if(error) {
				throwError("Invalid email or password.");
				template.errors.set({login: 'Invalid email or password.'});
			}
		});
	}
});