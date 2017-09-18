Meteor.publish('Tag.all', function() {
	return Tags.find();
});

