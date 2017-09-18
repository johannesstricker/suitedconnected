Meteor.startup(function() {
	/* Set MAIL_URL */
	if(!process.env.MAIL_URL) {
		process.env.MAIL_URL = Meteor.settings.MAIL_URL;
	}

	/* Configure Mandrill */
	let settings = Meteor.settings.private.mandrill;
	Mandrill.config({
	    username: settings.user,
	    key: settings.apiKey
	});
});


Accounts.emailTemplates.headers = { 'X-MC-AutoText': true };
Accounts.emailTemplates.siteName = "suitedconnected";
Accounts.emailTemplates.from = "suitedconnected <team@suitedconnected.com>";

/** VERIFY EMAIL */
Accounts.emailTemplates.verifyEmail.subject = function() {
	return "[suitedconnected] Welcome to suitedconnected!";
};
Accounts.emailTemplates.verifyEmail.html = function(user, url) {
	try {
	  result = Mandrill.templates.render({
	    template_name: 'email-verification',
	    template_content: [
	    	// empty
	    ],
	    merge_vars: [
	      {
	        name: 'VERIFICATION_URL',
	        content: url.replace('#/', '')
	      },
	      {
	      	name: 'USERNAME',
	      	content: user.username
	      }
	    ]
	  });
	} catch (error) {
	  console.error('Error while rendering Mandrill template', error);
	}
	return result.data.html;
};

/** RESET PASSWORD */
Accounts.emailTemplates.resetPassword.subject = function() {
	return "[suitedconnected] You have requested to reset your password.";
};
Accounts.emailTemplates.resetPassword.html = function(user, url) {
	try {
	  result = Mandrill.templates.render({
	    template_name: 'change-password',
	    template_content: [
	    	// empty
	    ],
	    merge_vars: [
	      {
	        name: 'PASSWORD_URL',
	        content: url.replace('#/', '')
	      },
	      {
	      	name: 'USERNAME',
	      	content: user.username
	      }
	    ]
	  });
	} catch (error) {
	  console.error('Error while rendering Mandrill template', error);
	}
	return result.data.html;
};
