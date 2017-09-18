/* Notification List */
Template.notificationList.onCreated(function() {
	var instance = this;

	instance.reset = function() {
		if(instance.limit) {instance.limit.set(10);} else {instance.limit = new ReactiveVar(10);}
		if(instance.loaded) {instance.loaded.set(0);} else {instance.loaded = new ReactiveVar(0);}
		if(instance.state) {
			instance.state.set('isLoading', false);
		} else {
			instance.state = new ReactiveDict();
			instance.state.setDefault({
				isLoading: false,
			});
		}
	}
	instance.reset();

	instance.hasMore = function() {
		return instance.notifications().count() >= instance.loaded.get();
	},
	instance.loadMore = function() {
		if(!(instance.state.get('isLoading')) && instance.hasMore()) {
			instance.limit.set(instance.limit.get() + 5);
		}
	};
	instance.notifications = function() {
		return Notifications.find({userId: Meteor.userId()}, {limit: instance.loaded.get(), sort: {read: 1, date: -1}});
	};
	instance.autorun(function() {
		let limit = instance.limit.get();
		instance.state.set('isLoading', true);
		instance.subscribe('Notification.user', limit, {
			onReady: function() {
				setTimeout(function() {
					instance.loaded.set(limit);
					instance.state.set('isLoading', false);
				}, 1000);
			},
		});
	});
	instance.autorun(function() {
		let userId = Meteor.userId();
		instance.reset();
	});
});

Template.notificationList.helpers({
	'hasMore': function() {
		return Template.instance().hasMore();
	},
})

Template.notificationList.events({
	'click .js-read-all': function(e, instance) {
		e.preventDefault();
		Meteor.call('Notification.markAllRead');
	},
	'click .js-load-more': function(e, instance) {
		e.preventDefault();
		instance.loadMore();
	},
});

var uiHooks = {
	insertElement: function(node, next) {
		$(node).insertBefore(next);
		if($(node).hasClass('js-loading')) {
			let target = $('.js-scroll');
			target.scrollTop(target[0].scrollHeight);
		}
	},
};
Template.notificationList.onRendered(function() {
	const instance = Template.instance();
	/* Automatically load more notifications on scrolling. */
	$('.js-lazy-load-notifications').on('scroll.notificationList', function(e) {
		let target = $(e.target);
		if(target[0].scrollHeight - target.scrollTop() == target.outerHeight()) {
			instance.loadMore();
		}
	});
	this.find('.js-scroll')._uihooks = uiHooks;
});

Template.notificationItem.events({
	'click .js-notification-link': function(e, template) {
		e.preventDefault();
		Meteor.call('Notification.markRead', this._id);
		this.visit();
	},
	'click .js-notification-check': function(e, template) {
		e.preventDefault();
		Meteor.call('Notification.markRead', this._id);
	},
});