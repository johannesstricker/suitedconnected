Feedback = function(doc) {
	_.extend(this, doc);
};
_.extend(Feedback.prototype, {

});

FeedbackCollection = new Mongo.Collection('feedback', {
	transform: function(doc) {
		return new Feedback(doc);
	},
});