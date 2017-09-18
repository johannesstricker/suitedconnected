Template.sidebarOptions.helpers({
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
	groupId: function() {
		const instance = Template.instance();
		if(instance.data && instance.data.group)
			return instance.data.group._id;
	}
});