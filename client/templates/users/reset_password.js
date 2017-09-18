Accounts.onResetPasswordLink(function(token, callback) {
	Session.set('passwordToken', token);
	Session.set('passwordResetCallback', callback);

	Session.set('resetPasswordCallback', function() {
		callback();
		Session.set('resetPasswordCallback', null);
	});
	Router.go('resetPassword', {token: token});
});

Template.resetPassword.onCreated(function() {

});