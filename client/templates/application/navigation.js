Template.primaryNavigation.helpers({
    highlightActiveRoute: function() {
        var args = Array.prototype.slice.call(arguments, 0);
        if(args.length === 0) {
            return;
        }
        args.pop();

        var active = _.any(args, function(name) {
            return Router.current() && Router.current().route && Router.current().route.getName() === name;
        });

        return active && 'active';
    },
});

Template.secondaryNavigation.helpers({
    tagInputSettings: function() {
        const instance = Template.instance();
        return { placeholder: 'Filter by tags...', reference: Template.currentData().tags };
    },
});

Template.secondaryNavigation.events({
    'click .js-click-menu-trigger': function(e, instance) {
        e.preventDefault();
        $('.mobile-overlay').addClass('overlay-visible');
        $('html').addClass('no-scroll-mobile');
        $('.mobile-menu').addClass('menu-open').addClass('menu-open-transformation');
    },
});