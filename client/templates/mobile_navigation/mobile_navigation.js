Template.mobileMenu.onCreated(function() {
    const instance = this;
    instance.currentTemplate = new ReactiveVar('mobileMenuItems');
    instance.currentAccountTemplate = new ReactiveVar('login');

    instance.close = function() {
        $('.mobile-overlay').removeClass('overlay-visible');
        $('.mobile-menu').removeClass('menu-open');
        $('html').removeClass('no-scroll-mobile');
        $('.mobile-menu').removeClass('menu-open-transformation');
    };
    instance.getCurrentTemplate = function() {
        if(Meteor.user())
            return instance.currentTemplate.get();
        return 'mobileMenuItems';
    };
});

Template.mobileMenu.helpers({
    getClass: function(tpl) {
        const instance = Template.instance();
        return tpl !== instance.getCurrentTemplate() && 'hidden';
    },
    isCurrentTemplate: function(name) {
        const intance = Template.instance();
        return instance.getCurrentTemplate() === name;
    },
    getAccountTemplate: function() {
        const instance = Template.instance();
        if(Meteor.user()) {
            return 'profileUser';
        }
        if(Meteor.loggingIn()) {
            return 'spinner';
        }
        return instance.currentAccountTemplate.get();
    },
    highlightCurrentTab: function(name) {
        const instance = Template.instance();
        if(name == instance.getCurrentTemplate())
            return 'selected';
        return '';
    },
    showCurrentContent: function(name) {
        const instance = Template.instance();
        if(!Meteor.user())
            return name == 'mobileMenuItems';
        if(name == instance.getCurrentTemplate())
            return true;
        return false;
    },
    activateNotificationLoad: function() {
        const instance = Template.instance();
        if(instance.getCurrentTemplate() == 'notificationList')
            return 'js-lazy-load-notifications';
        return '';
    },
    showPostButtons: function() {
        const instance = Template.instance();
        var args = ['postSubmit', 'postSubmitHand', 'postPage', 'postEdit', 'groupJoin'];
        var hide = _.any(args, function(name) {
            return Router.current() && Router.current().route && Router.current().route.getName() === name;
        });

        return hide && 'hidden';
    },
    canPost: function() {
        const instance = Template.instance();
        if(!instance.data) {
            return false;
        }
        if(!instance.data.groupId || instance.data.groupId === PUBLIC_GROUP) {
            return !!Meteor.user();
        }
        let group = Groups.findOne({_id: instance.data.groupId});
        return group && group.canPost();
    },
});

Template.mobileMenu.events({
    'click .js-change-tab': function(e, instance) {
        e.preventDefault();
        let currentTemplate = instance.getCurrentTemplate();
        let newTab = $(e.target).attr('data-tab');
        instance.currentTemplate.set(newTab);
        instance.$('.js-lazy-load-notifications').off('scroll');
    },
    'click .js-click-overlay': function(e, instance) {
        e.preventDefault();
        instance.close();
    },
    'click a': function(e, instance) {
        if(!$(e.target).hasClass('js-no-close'))
            instance.close();
    },
    'click .js-click-logout': function(e, instance) {
        e.preventDefault();
        Meteor.logout();
    },
    'click .js-show-login': function(e, instance) {
        e.preventDefault();
        instance.currentAccountTemplate.set('login');
    },
    'click .js-show-signup': function(e, instance) {
        e.preventDefault();
        instance.currentAccountTemplate.set('registration');
    }
});

