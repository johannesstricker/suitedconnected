Template.userPreview.onCreated(function() {
	var instance = this;
	instance.state = new ReactiveDict();
	instance.state.setDefault({
		'isLoading': true,
	});
	instance.user = null;

	instance.autorun(function() {
		let subscription = instance.subscribe('User.single', instance.data.userId);
		if(subscription.ready()) {
			instance.user = Meteor.users.findOne({_id: instance.data.userId});
			instance.state.set('isLoading', false);
		}
	});
});


