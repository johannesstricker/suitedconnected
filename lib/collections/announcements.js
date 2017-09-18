Announcement = function(doc) {
	_.extend(this, doc);
};
_.extend(Announcement.prototype, {

});
Announcements = new Mongo.Collection('announcements', {
	transform: function(doc) {
		return new Announcement(doc);
	},
});
_.extend(Announcements, {
	findPending: function(groupId) {
		groupId = groupId === undefined ? PUBLIC_GROUP : groupId;
		return Announcements.find({$or: [{groupId: groupId, dueDate: {$exists: false}}, {groupId: groupId, dueDate: {$gte: new Date()}}]}, {sort: {dueDate: -1, createdAt: -1}});
	}
});