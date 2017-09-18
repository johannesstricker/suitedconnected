returnUser = function(doc) {
	_.extend(this, doc);
};

User = function(doc) {
	_.extend(this, doc);
};
_.extend(User.prototype, {
	isCurrentUser: function() {
		return Meteor.userId() === this._id;
	},
	canEdit: function(userId) {
		userId = userId === undefined ? Meteor.userId() : userId;
		let isAdmin = Roles.userIsInRole(userId, ['admin'], 'public');
		let isCurrentUser = userId === this._id;
		return isCurrentUser || isAdmin;
	},
	findGroups: function(includeInvitations /* = false */) {
		includeInvitations = includeInvitations === undefined ? false : true;
		if(includeInvitations) {
			return Groups.find({$or: [{members: this._id}, {invitations: this._id}]});
		}
		return Groups.find({members: this._id});
	},
	findInvitations: function() {
		return Groups.find({invitations: this._id});
	},
	findThumbnail: function() {
		let thumb = Thumbnails.findOne({'meta.userId': this._id}, {sort: {uploadedAt: -1}});
		return !!thumb ? thumb : {url: function() { return ''; }};
	},
	/** returns a link to the thumbnail of this post. **/
	thumbnail: function(size) {
		let thumb = Thumbnails.findOne({'meta.userId': this._id}, {sort: {uploadedAt: -1}});
		return thumb ? thumb.url({store: size, uploading: '/img/icons/loading.gif', storing: '/img/icons/loading.gif'}) : '';
	},
	/** returns the users profile.bio or placeholder text if its not available. **/
	getInfo: function() {
		return (!!this.profile && !!this.profile.bio) ? this.profile.bio : 'No information available.';
	},
	/** returns true if the user is allowed to publish announcements in the group with groupId/public **/
	canAnnounce: function(groupId) {
		groupId = groupId === undefined ? PUBLIC_GROUP : groupId;
		check(groupId, String);
		return Roles.userIsInRole(Meteor.userId(), ['admin'], groupId);
	},
	findTags: function() {
		let tagIds = !!this.stats.tags ? Object.keys(this.stats.tags) : [];
		return Tags.find({_id: {$in: tagIds}});
	},
});

var transform = function (doc) { return new User(doc); };

var find = Meteor.users.find;
var findOne = Meteor.users.findOne;

Meteor.users.find = function (selector, options) {
  selector = selector || {};
  options = options || {};
  return find.call(this, selector, _.extend({transform: transform}, options));
};

Meteor.users.findOne = function (selector, options) {
  selector = selector || {};
  options = options || {};
  return findOne.call(this, selector, _.extend({transform: transform}, options));
};

_.extend(Meteor.users, {
	// nothing yet
});

