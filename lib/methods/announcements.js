Meteor.methods({
	'Announcement.create': function(announcement) {
		check(Meteor.userId(), String);
		let toValidate = ['body', 'groupId'];
		if(_.has(announcement, 'dueDate')) {
			toValidate.push('dueDate');
		}
		check(announcement, AnnouncementsSchema.pick(['body', 'groupId', 'dueDate']));

		if(!Roles.userIsInRole(Meteor.userId(), ['admin'], !!announcement.groupId ? announcement.groupId : PUBLIC_GROUP)) {
			throw new Meteor.Error(403, 'You are not allowed to create this announcement.');
		}

		return {_id: Announcements.mutate.create(announcement)};
	},
	'Announcement.delete': function(announcementId) {
		check(Meteor.userId(), String);
		check(announcementId, String);

		let announcement = findOrThrow(announcementId, Announcements);
		if(!Roles.userIsInRole(Meteor.userId(), ['admin'], announcement.groupId)) {
			throw new Meteor.Error(403, 'You are not allowed to delete this announcement.');
		}

		return Announcements.mutate.delete(announcementId);
	}
});