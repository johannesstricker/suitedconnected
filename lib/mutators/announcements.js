Announcements.mutate = {
	'create': function(announcement) {
		// TODO: check
		announcement = _.defaults(announcement, {
			userId: tryUserId(),
			author: tryUserName(),
			groupId: PUBLIC_GROUP,
		});
		return Announcements.insert(announcement);
	},
	'delete': function(announcementId) {
		return Announcements.remove({_id: announcementId});
	},
};