EmailTemplates = {};

EmailTemplates.emailLayout = {
	path: 'email/email_layout.html',
	// css: 'email/email_layout.css',
	helpers: {
		title: 'suitedconnected',
	},
	route: {
		path: '/email-layout/',
		data: function(params) {
			return {};
		},
	},
};


EmailTemplates.emailVerification = {
	path: 'email/email_verification.html',
	// css: 'email/email_verification.css',
	helpers: {
		// no helpers yet
	},
	route: {
		path: '/email-verification/:name/:url',
		data: function(params) {
			return {username: params.name, url: params.url};
		},
	},
};

EmailTemplates.feedback = {
	path: 'email/feedback.html',
	helpers: {
		// no helpers yet
	},
	route: {
		path: '/feedback/:name/:mail',
		data: function(params) {
			return {
				username: params.name,
				email: params.mail,
				feedback: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
			};
		},
	},
};

EmailTemplates.resetPassword = {
	path: 'email/reset_password.html',
	helpers: {
		// no helpers yet
	},
	route: {
		path: '/reset-password/:name/:url',
		data: function(params) {
			return {username: params.name, url: params.url};
		},
	},
};

