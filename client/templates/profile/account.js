Template.account.onCreated(function() {
	this.editing = new ReactiveVar(false);
});

Template.account.helpers({
	editing: function() {
		return Template.instance().editing.get();
	},
	bodyContext: function() {
		return _.extend(_.clone(this.user), {editing: Template.instance().editing.get()});
	},
	groupIds: function() {
		let groupIds = [PUBLIC_GROUP];
		if(Meteor.user()) {
			groupIds = _.union(groupIds, _.pluck(Meteor.user().findGroups().fetch(), '_id'));
		}
		return groupIds;
	},
});

Template.account.events({
	'click #edit-info': function(e, template) {
		e.preventDefault();
		template.editing.set(true);
	},
	'click #save-info': function(e, template) {
		e.preventDefault();
		let userId = this._id;
		let info = $('#info-input').val();
		Meteor.call('User.editInfo', userId, info, function(error, result) {
			if(error) {
				return throwError(error);
			}
			template.editing.set(false);
		});
	},
	'click #cancel-info': function(e, template) {
		e.preventDefault();
		template.editing.set(false);
	},
});

Template.profileInfoForm.onRendered(function() {
	fitToContent('info-input', 350);
});

Template.accountHead.events({
	'change .thumbnail-file': function(e, template) {
		let userId = this.user._id;
		let username = this.user.username;

		FS.Utility.eachFile(e, function(file) {
			var fsFile = new FS.File(file);
			fsFile.meta = {userId: userId, name: username};
			Thumbnails.insert(fsFile, function(error, fileObject) {
				if(error) {
					throwError(error);
				}
			});
		});
	},
	'click .js-click-thumbnail, touchend .js-click-thumbnail': function(e, template) {
		e.preventDefault();
		$('.thumbnail-file').click();
	},
});

