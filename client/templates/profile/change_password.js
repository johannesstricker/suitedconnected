Template.changePassword.onCreated(function() {
	var instance = this;
	instance.errors = new ReactiveVar({});
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		passwordChanged: false,
	});
});
Template.changePassword.events({
	'click #save-password': function(e, instance) {
		e.preventDefault();
		instance.errors.set({});

		let password = instance.$('#password').val();
		let confirmation = instance.$('#password-confirm').val();
		if(password !== confirmation) {
			return instance.errors.set({'change-password': 'Your passwords do not match.'});
		}

		if(!RegistrationSchema.validateValue(password, 'password')) {
			return instance.errors.set({'change-password': 'Please enter a password with at least 6 characters.'});
		}

		instance.$('#password').val('');
		instance.$('#password-confirm').val('');


		if(instance.data.token) {
			Accounts.resetPassword(instance.data.token, password, function(error, result) {
				if(error) {
					return throwError(error.reason);
				}	
				let resetPasswordCallback = Session.get('resetPasswordCallback');
				if(resetPasswordCallback) {
					resetPasswordCallback();
				}
				Router.go('index');						
			});
		} else {
			Meteor.call('User.changePassword', password, confirmation, function(error, result) {
				if(error) {
					return throwError(error.reason);
				}
				instance.state.set('passwordChanged', true);
				setTimeout(function() {
					instance.state.set('passwordChanged', false);
				}, 3000);
			});
		}


	},
});