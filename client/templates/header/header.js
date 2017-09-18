Template.header.onCreated(function () {
	var self = this;
	var tagsFromSession = function(name) {
		return Session.get(name) instanceof Array ? Tags.find({_id: {$in: Session.get(name)}}).fetch() : [];
	};

	this.tags = new ReactiveVar(tagsFromSession('tagIds'));

	this.autorun(function() {
		let tags = self.tags.get();
		Session.set('tagIds', _.uniq(_.pluck(tags, '_id')));
	});
	this.autorun(function() {
		self.tags.set(tagsFromSession('tagIds'));
	});
});

Template.header.helpers({
	highlightNotifications: function() {
		return Counts.get('notifications') > 0 ? 'highlight' : '';
	},
	highlightActiveRoute: function() {
		var args = Array.prototype.slice.call(arguments, 0);
		if(args.length === 0) {
			return;
		}
		args.pop();

		var active = _.any(args, function(name) {
			return Router.current() && Router.current().route && Router.current().route.getName() === name;
		});

		return active && 'highlight';
	},
	tagInputSettings: function() {
		return {reference: Template.instance().tags, placeholder: 'Search for tags...'};
	},
	notificationCount: function() {
		return Counts.get('notifications');
	}
});

Template.header.events({
	'click .group-dropdown-toggle': function(e, template) {
		e.preventDefault();
	},
  'click .js-click-logout': function(e, template) {
    e.preventDefault();
    Meteor.logout();
  },
});
