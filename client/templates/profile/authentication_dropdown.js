Template.authenticationDropdown.onCreated(function() {
    const instance = this;
    instance.currentTemplate = new ReactiveVar('login');
});

Template.authenticationDropdown.helpers({
    currentTemplate: function() {
        const instance = Template.instance();
        return instance.currentTemplate.get();
    },
    dataContext: function() {
        const instance = Template.instance();
        return instance.currentTemplate;
    }
});

Template.authenticationDropdown.events({
    'click .js-show-signup': function(e, instance) {
        e.preventDefault();
        instance.currentTemplate.set('registration');
    },
    'click .js-show-retrieve-password': function(e, instance) {
        e.preventDefault();
        instance.currentTemplate.set('forgotPassword');
    },
    'click .js-show-login': function(e, instance) {
        e.preventDefault();
        instance.currentTemplate.set('login');
    }
});