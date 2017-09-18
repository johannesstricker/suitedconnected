/** Hooks **/
var hooks = {
	loginRequired: function() {
		if(!Meteor.user()) {
			if(Meteor.loggingIn()) {
				return this.render(this.loadingTemplate);
			} else {
				return this.render('accessDenied');
			}
		}
		this.next();
	},
	restrictToInvitee: function() {
		let group = Groups.findOne({_id: this.params._id});
		if(!group) {
			return this.render('notFound');
		} else if (group.isMember()) {
			return Router.go('groupPage', {_id: this.params._id});
		} else if (!group.isInvited()) {
			return this.render('accessDenied');
		}
		this.next();
	},
	restrictToMember: function() {
		let group = Groups.findOne({_id: this.params._id});
		if(!group) {
			return this.render('notFound');
		} else if(group.isInvited()) {
			return Router.go('groupJoin');
		} else if (!group.isMember()) {
			return this.render('accessDenied');
		}
		this.next();
	},
	restrictToInviteeOrMember: function() {
		let group = Groups.findOne({_id: this.params._id});
		if(!group) {
			return this.render('notFound');
		} else if (!group.isInvited() && !group.isMember()) {
			return this.render('accessDenied');
		}
		this.next();
	},
	checkPostIsShared: function() {
		let post = Posts.findOne({_id: this.params._id, shared: true});
		if(!post) {
			return this.render('sharedNotAvailable');
		}
		this.next();
	},
	checkPostReadPermission: function() {
		let post = Posts.findOne({_id: this.params._id});
		if(!post) {
			return this.render('notFound');
		} else if (post.groupId && post.groupId !== 'public') {
			let group = Groups.findOne({_id: post.groupId});
			if(!group || !group.isMember()) {
				return this.render('accessDenied');
			}
		}
		this.next();
	},
	checkPostEditPermission: function() {
		let post = Posts.findOne({_id: this.params._id});
		if(!post) {
			return this.render('notFound');
		} else if (!post.canEdit()) {
			return this.render('accessDenied');
		}
		this.next();
	},
	checkPostSubmitPermission: function() {
		if(this.params.groupId) {
			let group = Groups.findOne(this.params.groupId);
			if(!group) {
				return this.render('notFound');
			} else if (!group.canPost()) {
				return this.render('accessDenied');
			}
		}
		this.next();
	},
};

/** Controllers **/
/** Requires the user to be logged in. **/
var LoginRequiredController = RouteController.extend({
	onBeforeAction: hooks.loginRequired,
});
/** Requires the user to be the member of target group. */
var GroupController = LoginRequiredController.extend({
	onBeforeAction: hooks.restrictToInviteeOrMember,
	data: function() {
		let group = Groups.findOne({_id: this.params._id});
		return {
			group: group,
		};
	},
});
var GroupMemberController = LoginRequiredController.extend({
	onBeforeAction: hooks.restrictToMember,
	data: function() {
		let group = Groups.findOne({_id: this.params._id});
		return {
			group: group,
		}
	},
});
/** Requires the user to be invited to target group. **/
var GroupInvitationController = LoginRequiredController.extend({
	onBeforeAction: hooks.restrictToInvitee,
	data: function() {
		let group = Groups.findOne({_id: this.params._id});
		return {
			group: group,
		};
	},
});
/** Requires the post to be publicly available or the user to have rights to read the post. **/
var PostController = RouteController.extend({
	onBeforeAction: hooks.checkPostReadPermission,
	waitOn: function() {
		return Meteor.subscribe('Post.single', this.params._id);
	},
	data: function() {
		let post = Posts.findOne({_id: this.params._id});
		let data = { post: post };
		if(post && post.groupId && post.groupId !== 'public') {
			data.group = Groups.findOne(post.groupId);
		}
		return data;
	},
});
var PostEditController = PostController.extend({
	onBeforeAction: hooks.checkPostEditPermission,
});
var PostSubmitController = LoginRequiredController.extend({
	onBeforeAction: hooks.checkPostSubmitPermission,
	data: function() {
		let data = {};
		if(this.params.groupId && this.params.groupId !== PUBLIC_GROUP) {
			data.group = Groups.findOne(this.params.groupId);
		}
		return data;
	},
});

var SharedController = RouteController.extend({
  layoutTemplate: 'sharedPostLayout',
  notFoundTemplate: 'sharedNotAvailable',
	onBeforeAction: hooks.checkPostIsShared,
	waitOn: function() {
		return Meteor.subscribe('Post.shared', this.params._id);
	},
	data: function() {
		return {
			post: Posts.findOne(this.params._id),
		};
	},
});


/*===========================================
=            PostListControllers            =
===========================================*/
var tagIds = new ReactiveVar([]);
var publicGroup = new ReactiveVar([PUBLIC_GROUP]);
/** This controller returns Public and Private posts for the user. */
var PostListController = RouteController.extend({
	template: 'postList',
	initial: 15,
	increment: 6,
	postLimit: function() {
		return parseInt(this.params.postLimit) || this.initial;
	},
	groups: function() {
		if(!Meteor.user())
			return publicGroup.get();
		return _.union(publicGroup.get(), _.pluck(Meteor.user().findGroups().fetch(), '_id'));
	},
	authors: function() {
		return [];
	},
	tags: tagIds,
	queryOptions: function() {
		let query = {};
		if(this.groups() && this.groups().length > 0)
			query = _.extend(query, {groupId: {$in: this.groups()}});
		if(this.tags.get().length > 0)
			query = _.extend(query, {tagIds: {$all: _.pluck(this.tags.get(), '_id')}});
		if(this.authors().length > 0)
			query = _.extend(query, {userId: {$in: this.authors()}});
		return query;
	},
	projectionOptions: function() {
		return {sort: {lastActivity: -1}, limit: this.postLimit()};
	},
	subscriptions: function() {
		this.postSub = Meteor.subscribe('Post.list', this.queryOptions(), this.projectionOptions());
	},
	posts: function() {
		return Posts.find(this.queryOptions(), this.projectionOptions());
	},
	data: function() {
		let hasMore = this.posts().count() === this.postLimit();
		var nextPath = this.route.path({postLimit: this.postLimit() + this.increment});
		return {
			posts: this.posts(),
			ready: this.postSub.ready,
			nextPath: hasMore ? nextPath : null,
			tags: this.tags
		};
	},
	fastRender: true,
});

/** This controller only returns post from the user's groups. */
var PrivatePostListController = PostListController.extend({
	onBeforeAction: hooks.loginRequired,
	groups: function() {
		if(!Meteor.user())
			return [];
		return _.pluck(Meteor.user().findGroups().fetch(), '_id');
	},
});

/** This controller returns all public posts. */
var PublicPostListController = PostListController.extend({
	groups: function() {
		return [PUBLIC_GROUP];
	},
});

/** This controllers returns all posts created by target user across shared groups and public. */
var ProfilePostListController = PostListController.extend({
	authors: function() {
		return [this.params._id];
	},
	data: function() {
		let hasMore = this.posts().count() === this.postLimit();
		var nextPath = this.route.path({_id: this.params._id, postLimit: this.postLimit() + this.increment});
		return {
			user:  Meteor.users.findOne(this.params._id),
			posts: this.posts(),
			ready: this.postSub.ready,
			nextPath: hasMore ? nextPath : null,
			tags: this.tags
		};
	}
});

var MyPostListController = PostListController.extend({
	onBeforeAction: hooks.loginRequired,
	authors: function() {
		return [Meteor.userId()];
	},
	data: function() {
		let hasMore = this.posts().count() === this.postLimit();
		var nextPath = this.route.path({postLimit: this.postLimit() + this.increment});
		return {
			user:  Meteor.user(),
			posts: this.posts(),
			ready: this.postSub.ready,
			nextPath: hasMore ? nextPath : null,
			tags: this.tags
		};
	}
});

/** This controller returns all posts from target group. */
var GroupPostListController = PostListController.extend({
	onBeforeAction: hooks.restrictToMember,
	groups: function() {
		return [this.params._id];
	},
	data: function() {
		let hasMore = this.posts().count() === this.postLimit();
		var nextPath = this.route.path({_id: this.params._id, postLimit: this.postLimit() + this.increment});
		return {
			group: Groups.findOne(this.params._id),
			posts: this.posts(),
			ready: this.postSub.ready,
			nextPath: hasMore ? nextPath : null,
			tags: this.tags
		};
	}
});

/*============================================
=            Global Configuration            =
============================================*/

Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
	waitOn: function() {
		if(!Meteor.user()) {
			return [Meteor.subscribe('Announcements.public'), Meteor.subscribe('Tag.all')];
		}
		return [Meteor.subscribe('User.readPosts'), Meteor.subscribe('Announcements.public'), Meteor.subscribe('Tag.all'), Meteor.subscribe('Notification.count'), Meteor.subscribe('Group.member'), Meteor.subscribe('Group.invited'), Meteor.subscribe('User.thumbnail', Meteor.userId())];
	},
	data: {},
	onBeforeAction: function() {
		$('body').attr('lang', 'en');
		this.next();
	},
});


/*==============================
=            Routes            =
==============================*/

Router.route('/', {
	name: 'landingPage',
	template: 'landingPage',
	layoutTemplate: null,
	onBeforeAction: function() {
		if(Meteor.user()) {
			return Router.go('index');
		}
		this.next();
	}
});

/** Group routes **/
Router.route('/create-group', {
	name: 'groupCreate',
	template: 'groupCreate',
	controller: LoginRequiredController
});
Router.route('/group/:_id/:postLimit?', {
	name: 'groupPage',
	template: 'groupPage',
	controller: GroupPostListController,
});
Router.route('/edit-group/:_id', {
	name: 'groupEdit',
	template: 'groupEdit',
	controller: GroupController,
});
Router.route('/join-group/:_id', {
	name: 'groupJoin',
	template: 'groupJoin',
	controller: GroupInvitationController,
});

/** Profile routes **/
Router.route('/profile/:_id/:postLimit?', {
	name: 'profile',
	template: 'account',
	controller: ProfilePostListController,
	waitOn: function() {
		return Meteor.subscribe('User.single', this.params._id);
	}
});
Router.route('/my-posts/:postLimit?', {
	name: 'myPosts',
	template: 'myPosts',
	controller: MyPostListController
});


/** Post routes **/
Router.route('/post/submit/:groupId?', {
	name: 'postSubmit',
	template: 'postSubmit',
	controller: PostSubmitController,
});
Router.route('/post/submit-handhistory/:groupId?', {
	name: 'postSubmitHand',
	template: 'postSubmitHand',
	controller: PostSubmitController,
});
Router.route('/post/:_id', {
	name: 'postPage',
	template: 'postPage',
	controller: PostController,
});
Router.route('/post/:_id/edit', {
	name: 'postEdit',
	template: 'postEdit',
	controller: PostEditController,
});

/* Shared Route */
Router.route('/shared/:_id', {
	name: 'shared',
	template: 'sharedPost',
	controller: SharedController,
});

/** Newsfeed Routes **/
Router.route('/feed/:postLimit?', {
	name: 'index',
	template: 'newsfeed',
	controller: PostListController
});
Router.route('/public-feed/:postLimit?', {
	name: 'public',
	template: 'newsfeed',
	controller: PublicPostListController
});
Router.route('/private-feed/:postLimit?', {
	name: 'private',
	template: 'newsfeed',
	controller: PrivatePostListController
});

/** Email Verification **/
Router.route('/verify-email/:token', function() {
	this.redirect('/feed');
	Accounts.verifyEmail(this.params.token, function(error) {
		if(error) {
			swal("Ooops..", "..there has been an error with the verification of your email address.", "error");
		} else {
			swal("Thank you!", "Your email has been verified.", "success");
		}
	});
}, {
	name: 'verify-email'
});

/** Reset Password **/
Router.route('/reset-password/:token', function() {
	this.redirect('/feed');
	let token = this.params.token;
	swal({
		title: 'Change your password',
		text: 'Please type in a new password. It should contain at least 6 letters, but the more secure, the better!',
		type: 'input',
		inputType: "password",
		showCancelButton: true,
		closeOnConfirm: false
	},
	function(newPassword) {
		if (newPassword === false)
			return false;
		let errors = RegistrationSchema.validate({password: newPassword}, {password: "Your password should contain at least 6 characters."});
		if(Object.keys(errors).length > 0)
		{
			swal.showInputError(errors['password']);
			return false;
		}
		Accounts.resetPassword(token, newPassword, function(error) {
			if(error) {
				swal.showInputError(error.reason);
				return false;
			} else {
				swal("Thank you!", "Your password has been changed.", "success");
			}
		});
	});
}, {
	name: 'resetPassword'
});
