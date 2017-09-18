Template.newsfeed.helpers({
	currentFeedName: function() {
		if(Router.current() && Router.current().route && Router.current().route.getName() === 'public')
			return 'Public';
		if(Router.current() && Router.current().route && Router.current().route.getName() === 'private')
			return 'Private';
		return 'All';
	},
});