Template.announcements.onCreated(function() {
	var instance = this;
	instance.isAnnouncing = new ReactiveVar(false);
	instance.sending = false;
});
Template.announcements.helpers({
	announcements: function() {
		const instance = Template.instance();
		return Announcements.findPending(instance.data.groupId);
	},
});
Template.announcements.events({
	'click .js-announce': function(e, instance) {
		e.preventDefault();
		instance.isAnnouncing.set(true);
	},
	'click .js-delete-announcement': function(e, instance) {
		e.preventDefault();
		let announcementId = $(e.target).attr('data-announcement-id');
		Meteor.call('Announcement.delete', announcementId, function(error, result) {
			if(error) {
				return throwError(error);
			}
		});
	}
});
Template.announcements.onRendered(function() {
	this.find('.announcements')._uihooks = {
		insertElement: function(node, next) {
			$(node).hide().insertBefore(next).fadeIn();
		},
		removeElement: function(node, next) {
			$(node).fadeOut(function() {
				$(this).remove();
			});
		}
	}
});

Template.addAnnouncement.onCreated(function() {
	var instance = this;
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		input: '',
		maxInput: AnnouncementsSchema._schema.body.max,
	});
	instance.errors = new ReactiveVar({});
});
Template.addAnnouncement.helpers({
	charactersLeft: function() {
		const instance = Template.instance();
		return instance.state.get('maxInput') - instance.state.get('input').length;
	},	
});
Template.addAnnouncement.events({
	'input .js-input-announcement': function(e, instance) {
		let input = $(e.target).val();
		instance.state.set('input', input);
	},
	'click .js-submit-announcement': function(e, instance) {
		e.preventDefault();
		if(instance.sending) {
			return;
		}
		let announcement = {
			body: instance.state.get('input'),
			groupId: instance.data.groupId,
		};

		let dueDate = $('.js-datetime').val();
		if(dueDate && dueDate !== "") {
			dueDate = moment(dueDate, "MM/DD/YYYY hh:mm a");
			if(dueDate.isValid()) {
				announcement.dueDate = dueDate.toDate();
			}
		}

		/* Validation */
		instance.errors.set({});
		var errors = AnnouncementsSchema.validate(announcement, {body: 'Please enter between 3 and 140 characters.'});
		if(Object.keys(errors).length > 0) {
			return instance.errors.set(errors);
		}		

		instance.sending = true;
		Meteor.call('Announcement.create', announcement, function(error, result) {
			instance.sending = false;
			if(error) {
				return throwError(error);
			}
			instance.data.isAnnouncing.set(false);
		});
	},
	'click .js-cancel-announcement': function(e, instance) {
		e.preventDefault();
		instance.state.set('input', '');
		instance.data.isAnnouncing.set(false);
	},	
});
Template.addAnnouncement.onRendered(function() {
	var instance = this;
	instance.$('.js-datetime').datetimepicker({
		todayButton: false,
		step: 15,
	});
});