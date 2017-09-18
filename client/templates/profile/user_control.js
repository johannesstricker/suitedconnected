Template.userControl.onCreated(function() {
	var instance = this;
	instance.currentTemplate = new ReactiveVar(null);

	instance.getCurrentTemplate = function() {
		let currentTemplate = instance.currentTemplate.get();

		if(Meteor.user()) {
			// logged in
			instance.currentTemplate.set(null);
			return 'profile';
		}
		if(Meteor.loggingIn() && instance.currentTemplate.get() !== 'login') {
			// logging in
			return 'spinner';
		}
		// logged out
		switch(currentTemplate) {
			case 'login':
				return 'login';
			case 'registration':
				return 'registration';
			case 'forgotPassword':
				return 'forgotPassword';
		}
		instance.currentTemplate.set(null);
		return 'loginOrSignup';		
	};
});
Template.userControl.helpers({
	template: function() {
		const instance = Template.instance();
		return instance.getCurrentTemplate();
	},
	templateData: function() {
		const instance = Template.instance();
		return {
			currentTemplate: instance.currentTemplate,
		};
	},
});
Template.userControl.events({
	'click .cancel': function(e, template) {
		e.preventDefault();
		template.currentTemplate.set(null);
	},
	'click .show-login': function(e, template) {
		e.preventDefault();
		template.currentTemplate.set('login');
	},
	'click .show-registration': function(e, template) {
		e.preventDefault();
		template.currentTemplate.set('registration');
	},
	'click #forgot-password': function(e, template) {
		e.preventDefault();
		template.currentTemplate.set('forgotPassword');
	},
});