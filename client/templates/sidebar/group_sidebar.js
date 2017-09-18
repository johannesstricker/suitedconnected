Template.memberThumbnail.onCreated(function() {
	this.hovered = new ReactiveVar(false);
});
Template.memberThumbnail.helpers({
	showMemberInfo: function() {
		return Template.instance().hovered.get();
	},
})
Template.memberThumbnail.events({
	'mouseenter .js-user-hover': function(e, template) {
		template.hovered.set(true);
	},
	'mouseleave .js-user-hover': function(e, template) {
		template.hovered.set(false);
	},
	'dragstart .js-user-hover': function(e, template) {
		template.hovered.set(false);
	},
});