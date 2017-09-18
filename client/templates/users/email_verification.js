Template.emailVerification.onCreated(function() {
	var instance = this;
	instance.pending = new ReactiveVar(true);
	instance.verified = new ReactiveVar(false);
	instance.error = new ReactiveVar(null);

	Accounts.verifyEmail(instance.data.token, function(error) {
		if(error) {
			instance.error.set(error.reason);
		} else {
			instance.verified.set(true);
		}
		instance.pending.set(false); 
	});
});

