Template.groupCreate.onCreated(function() {
	var instance = this;
	instance.errors = new ReactiveVar({});
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		members: [],
	});
	instance.sending = false;
});

Template.groupCreate.helpers({
	maxNameLength: function() {
		return GroupsSchema._schema.name.max;
	},
	invitationContext: function() {
		const instance = Template.instance();
		let members = instance.state.get('members');
		let excludedUserIds = _.union([Meteor.userId()], members);
		var inviteCallback = function(userId) {
			instance.state.set('members', _.union(instance.state.get('members'), [userId]));
		};
		var uninviteCallback = function(userId) {
			instance.state.set('members', _.difference(instance.state.get('members'), [userId]));
		};
		return {	
			excludedUserIds: excludedUserIds,
			invitedUsers: Meteor.users.find({_id: {$in: members}}).fetch(),
			inviteCallback: inviteCallback,
			uninviteCallback: uninviteCallback,
			canInvite: true,
		};
	},
});

Template.groupCreate.events({
	'submit form': function(e, instance) {
		e.preventDefault();
		if(instance.sending) {
			return;
		}
		
		/* Form data */
		var group = {
			name: $(e.target).find('[name=name]').val(),
			info: $(e.target).find('[name=info]').val()
		};

		/* Validation */
		var errors = GroupsSchema.validate(group, {name: 'Please enter a name for your group.', info: 'Please enter a short description of your group.'});
		instance.errors.set(errors);
		if(Object.keys(errors).length > 0) {
			return;
		}

		/* Insert */
		instance.sending = true;
		Meteor.call('Group.create', group, function(error, result) {
			instance.sending = false;
			if(error) {
				return throwError(error.reason);
			}
			/* Invite members. */
			let groupId = result.groupId;
			Meteor.call('Group.invite', groupId, instance.state.get('members'), function(error, result) {
				if(error) {
					throwError(error.reason);
				}
				Router.go('groupEdit', {_id: groupId});
			});
		});
	}
});