Template.groupInvitations.onCreated(function() {
	var instance = this;

	/* Initialize state. */
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		isLoading: false,
		isInviting: false,
		draggedUserId: null,
		searchInput: '',
	});

	/* Get up to 10 suggested users, matching current search input. */
	instance.typeahead = function() {
		if(instance.state.get('isLoading') === false) {
			let searchInput = instance.state.get('searchInput');
			if(searchInput === '') {
				return [];
			}
			return Meteor.users.find({username: {$regex: '^' + searchInput, $options: 'i'}, _id: {$nin: instance.data.excludedUserIds}}, {limit: 10}).fetch();
		} else {
			return [];
		}		
	};

	/* Validate data context. */
	instance.autorun(function() {
		let data = Template.currentData();
		check(data.excludedUserIds, [String]);
		check(data.invitedUsers, Array);
		check(data.inviteCallback, Function);
		check(data.uninviteCallback, Function);
		check(data.canInvite, Boolean);
	});

	/* Update search input. */
	this.autorun(function() {
		let searchInput = instance.state.get('searchInput');
		if(searchInput !== '') {
			instance.state.set('isLoading', true);
			let subscription = Meteor.subscribe('User.search', searchInput);
			if(subscription.ready()) {
				setTimeout(function() {
					instance.state.set('isLoading', false);
				}, 1000);				
			}
		}
	});
});

Template.groupInvitations.onRendered(function() {
	var instance = this;
	$('body').on('click', function(e) {
		if($(e.target).parents('.js-toggle-inviting').length === 0) {
			instance.state.set('isInviting', false);
		}
	});
});

Template.groupInvitations.helpers({
	isDragging: function() {
		const instance = Template.instance();
		return instance.state.get('draggedUserId') !== null;
	},
	draggedUserId: function() {
		const instance = Template.instance();
		return instance.state.get('draggedUserId');
	},
	isUserInvited: function(userId) {
		const instance = Template.instance();
		return !!_.find(instance.data.invitedUsers, function(user) { return user._id === userId; });
	},
});

Template.groupInvitations.events({
	'input .js-user-search': function(e, instance) {
		let input = $(e.target).val();
		instance.state.set('searchInput', input);
	},
	'click .js-click-invite': function(e, instance) {
		e.preventDefault();
		e.stopPropagation();
		instance.state.set('isInviting', true);
	},
	'dragstart .js-user-drag': function(e, instance) {
		instance.state.set('draggedUserId', e.target.id);
	},
	'dragend .js-user-drag': function(e, instance) {
		instance.state.set('draggedUserId', null);
	},
	'dragover .droppable': function(e, instance) {
		e.preventDefault();
	},
	'drop .js-drop-uninvite': function(e, instance) {
		e.preventDefault();
		let userId = instance.state.get('draggedUserId');
		instance.state.set('draggedUserId', null);
		if(userId) {
			instance.data.uninviteCallback(userId);			
		}
	},
	'drop .js-drop-invite': function(e, instance) {
		e.preventDefault();
		let userId = instance.state.get('draggedUserId');
		instance.state.set('draggedUserId', null);
		if(userId) {
			instance.data.inviteCallback(userId);
		}
	},
});