Template.groupEdit.onCreated(function() {
	var self = this;
	self.errors = new ReactiveVar({});
	self.editing = new ReactiveVar(false);
	self.dragId = new ReactiveVar(null);
});

Template.groupEdit.helpers({
	group: function() {
		return Template.instance().data.group;
	},
	isPrimaryRole: function() {

	},
	editing: function() {
		return Template.instance().editing.get();
	},
	showDroppables: function() {
		return Template.instance().dragId.get() !== null;
	},
	dragId: function() {
		return Template.instance().dragId.get();
	},
	invitationContext: function() {
		const instance = Template.instance();
		var inviteCallback = function(userId) {
			Meteor.call('Group.invite', instance.data.group._id, userId, throwOnError);
		};
		var uninviteCallback = function(userId) {
			Meteor.call('Group.uninvite', instance.data.group._id, userId, throwOnError);
		};
		let excludedUserIds = _.union(instance.data.group.members, instance.data.group.invitations);
		let invitedUsers = instance.data.group.findInvitations().fetch();
		return {
			excludedUserIds: excludedUserIds,
			invitedUsers: invitedUsers,
			inviteCallback: inviteCallback,
			uninviteCallback: uninviteCallback,
			canInvite: instance.data.group.canInvite(),
		};
	},
});

Template.groupEdit.events({
	'click #edit-info': function(e, template) {
		e.preventDefault();
		template.editing.set(true);
	},
	'click #save-info': function(e, template) {
		e.preventDefault();

		var groupId = this.group._id;
		var groupProperties = {
			info: $('textarea[name=info]').val()
		};

		var errors = GroupsSchema.validate(groupProperties, {info: 'Please enter some information about the group.'});
		template.errors.set(errors);
		if(Object.keys(errors).length > 0) {
			return;
		}

		Meteor.call('Group.edit', groupId, groupProperties, function(error, result) {
			if(error) {
				console.log(error);
				return throwError(error.reason);
			}
			template.editing.set(false);
			Router.go('groupEdit', {_id: result.groupId});
		});
	},
	'click #cancel-info': function(e, template) {
		e.preventDefault();
		template.editing.set(false);
	},
	'click .js-delete-group': function(e, instance) {
		e.preventDefault();
		swal({
			title: "Are you sure you want to delete this group?",
			text: "Type <span class='highlight'>'FOLD'</span> below and click <span class='highlight'>'OK'</span>. Deletion cannot be undone.",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: 'slide-from-top',
			html: true,
		}, function(input) {
			if(!input || input.toUpperCase() !== 'FOLD')
				return swal.close();

			Meteor.call('Group.delete', instance.data.group._id, function(error, result) {
				if(error) {
					return swal('Error.', error.reason, 'error');
				}
				swal.close();
				return Router.go('index');
			});
		});
	},
	'click .js-leave-group': function(e, instance) {
		e.preventDefault();
		swal({
			title: "Are you sure you want to leave this group?",
			text: "Type <span class='highlight'>'LEAVE'</span> below and click <span class='highlight'>'OK'</span>.",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: 'slide-from-top',
			html: true,
		}, function(input) {
			if(!input || input.toUpperCase() !== 'LEAVE')
				return swal.close();

			Meteor.call('Group.leave', instance.data.group._id, function(error, result) {
				if(error) {
					return swal('Error.', error.reason, 'error');
				}
				swal.close();
				return Router.go('index');
			});
		});
	},
	'dragstart .js-user-drag': function(e, template) {
		template.dragId.set(e.target.id);
	},
	'dragend .js-user-drag': function(e, template) {
		template.dragId.set(null);
	},
	'dragover .droppable': function(e, template) {
		e.preventDefault();
	},
	'drop .droppable.promote': function(e, template) {
		e.preventDefault();
		e.stopPropagation();
		let dragId = template.dragId.get();
		let role = $(e.target).data('role');
		if(dragId) {
			Meteor.call('Group.promoteMember', this.group._id, dragId, [role]);
			template.dragId.set(null);
		}
	},
	'drop .droppable.kick': function(e, template) {
		e.preventDefault();
		let dragId = template.dragId.get();
		if(dragId) {
			Meteor.call('Group.kick', this.group._id, dragId);
			template.dragId.set(null);
		}
	},
});

Template.groupInfoForm.onRendered(function() {
	fitToContent('info-input', 350);
});

Template.groupHead.events({
	'change .thumbnail-file': function(e, template) {
		let groupId = this.group._id;
		let groupName = this.group.name;

		FS.Utility.eachFile(e, function(file) {
			var fsFile = new FS.File(file);
			fsFile.meta = {groupId: groupId, name: groupName};
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


