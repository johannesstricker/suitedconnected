Template.sidebarBootstrap.helpers({
    sidebarTitle: function() {
        const instance = Template.instance();
        if(Template.currentData() && Template.currentData().group) {
            return Template.currentData().group.name;
        }
        return 'suitedconnected';
    },
    sidebarTemplate: function() {
        const instance = Template.instance();
        if(Template.currentData() && Template.currentData().group) {
            return 'groupSidebar';
        }
        return 'sidebar';
    },
    sidebarContext: function() {
        const instance = Template.instance();
        if(Template.currentData() && Template.currentData().group) {
            return {group: Template.currentData().group};
        }
        return {};
    }
});