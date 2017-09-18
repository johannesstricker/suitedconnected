Template.postPage.onCreated(function() {
	var instance = this;
	instance.next = new ReactiveVar(null);
	instance.previous = new ReactiveVar(null);
	instance.editingCommentId = null;
	instance.editingComment = new ReactiveVar(null);

	instance.getGroupIds = function() {
		let ids = !!instance.data.groupIds ? [].concat(instance.data.groupIds) : [PUBLIC_GROUP];

		return {groupId: {$in: ids}};
	};
	instance.getAuthorIds = function() {
		let ids = !!instance.data.authorIds ? [].concat(instance.data.authorIds) : [];
		return ids.length > 0 ? {userId: {$in: ids}} : {};
	};
	instance.getTagIds = function() {
		let ids = !!instance.data.tagIds ? [].concat(instance.data.tagIds) : [];
		return ids.length > 0 ? {tagIds: {$all: ids}} : {};
	};
	instance.getSort = function() {
		return {sort: {lastActivity: -1, _id: -1}};
	};
	instance.getQuery = function() {
		let query = Session.get('query');
		if(query) {
			return query;
		}
		return _.extend({}, instance.getGroupIds(), instance.getAuthorIds(), instance.getTagIds());
	};
	instance.getProjection = function() {
		let projection = Session.get('projection');
		if(projection) {
			delete projection['limit'];
			return projection;
		}
		return _.extend({}, instance.getSort());
	};

	// THIS IS CAUSING PROBLEMS WHEN RETURNING TO NEWSFEED
	// instance.autorun(function() {
	// 	instance.subscribe('Post.next', instance.data.post, instance.getQuery(), instance.getProjection(), { // !reactive
	// 		onReady: function() {
	// 			let next = Posts.findNext(instance.data.post, instance.getQuery(), instance.getProjection());
	// 			if(next.count() > 0) {
	// 				instance.next.set(_.pluck(next.fetch(), '_id')[0]);
	// 			}
	// 		}
	// 	});

	// 	instance.subscribe('Post.previous', instance.data.post, instance.getQuery(), instance.getProjection(), {
	// 		onReady: function() {
	// 			let previous = Posts.findPrevious(instance.data.post, instance.getQuery(), instance.getProjection());
	// 			if(previous.count() > 0) {
	// 				instance.previous.set(_.pluck(previous.fetch(), '_id')[0]);
	// 			}
	// 		}
	// 	});
	// });

	instance.autorun(function() {
		let editingComment = instance.editingComment.get();
		if(!editingComment && instance.editingCommentId) {
			$commentNode = $('#comment-' + instance.editingCommentId);
			if($commentNode) {
				$('body').animate({scrollTop: $commentNode.position().top}, 250);
			}
		}
		instance.editingCommentId = !!editingComment ? editingComment._id : null;
	});


	instance.scrollButtons = function() {
		let halfPageHeight = $(window).scrollTop() + $(window).innerHeight() / 2;
		$('.js-scroll-btn').stop(false,false).animate({
			top: halfPageHeight,
		}, 300);
	};
	$(window).on('resize orientationChange scroll', function(event) {
	    instance.scrollButtons();
	});
});

Template.postPage.helpers({
	previousClass: function() {
		const instance = Template.instance();
		return instance.previous.get() ? '' : 'invisible';
	},
	nextClass: function() {
		const instance = Template.instance();
		return instance.next.get() ? '' : 'invisible';
	},
});

/* Events */
Template.postPage.events({
	'click .js-share-post': function(e, instance) {
		e.preventDefault();
		let id = instance.data.post._id;
		Meteor.call('Post.share', id, true, function(error, result) {
			if(error) {
				return throwError(error.reason);
			}
		});
	},
	'click .js-unshare-post': function(e, instance) {
		e.preventDefault();
		let id = instance.data.post._id;
		Meteor.call('Post.share', id, false, function(error, result) {
			if(error) {
				return throwError(error.reason);
			}
		});
	},
	'click .js-delete-post': function(e, instance) {
		e.preventDefault();
		let id = instance.data.post._id;
		let groupId = instance.data.post.groupId;

		swal({
			title: "Are you sure you want to delete this post?",
			text: "Type <span class='highlight'>'FOLD'</span> below and click <span class='highlight'>'OK'</span>. Deletion cannot be undone.",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: 'slide-from-top',
			html: true,
		}, function(input) {
			if(!input || input.toUpperCase() !== 'FOLD')
				return swal.close();

			Meteor.call('Post.delete', id, function(error, result) {
				if(error) {
					return swal('Error.', error.reason, 'error');
				}
				swal.close();
				if(groupId && groupId !== PUBLIC_GROUP) {
					return Router.go('groupPage', {_id: groupId});
				}
				return Router.go('index');
			});
		});
	},
	'click .js-edit-comment': function(e, instance) {
		e.preventDefault();
		let comment = this;

		instance.editingComment.set(null);

		setTimeout(function() {
			instance.editingComment.set(comment);
			$('body').animate({
				scrollTop: $(document).height()
			}, 250);
		}, 1);
	},
	'click .js-select-input': function(e, instance) {
		$(e.target).select();
	},
});

Template.postPage.onRendered(function() {
	const instance = this;
	instance.scrollButtons();

	/** Initialize image lightbox. **/
	images = instance.$('.body img');
	_.each(images, function(img) {
		let $img = $(img);
		$img.wrap($('<a>', {
			href: $img.attr('src'),
			class: 'js-image-lightbox',
		}));
	});
	$('.js-image-lightbox').imageLightbox({
		overlay: true,
	});

	/* Add mention links. */
	let mentions = instance.$('.js-mention');
	_.each(mentions, function(mention) {
		mention = $(mention);
		mention.attr('href', Router.routes.profile.path({_id: mention.attr('data-id')}));
	});

	/* Wrap iframes. */
	instance.$('.body iframe').wrap('<div class="flex-video" />');

	/* Scroll to anchor. */
	let hash = $(window.location.hash);
	if(hash && hash.length) {
		setTimeout(function() {
			$('body').animate({scrollTop: hash.offset().top}, 250);
		}, 850);
	}

	/* Read notifications. */
	Meteor.call('Notification.readPost', instance.data.post._id);
});

Template.postBody.helpers({
	shareLink: function() {
		const instance = Template.instance();
		return Router.routes.shared.url({_id: instance.data.post._id});
	},
});

Template.postBody.events({
	'click #upvote': function(e, template) {
		e.preventDefault();
		Meteor.call('Post.upvote', this.post._id, function(error, result) {
			if(error) {
				return throwError(error);
			}
		});
	},
});

Template.postPage.onDestroyed(function() {
	var instance = this;
	/** Update views. **/
	Meteor.call('Post.view', instance.data.post._id);
});
