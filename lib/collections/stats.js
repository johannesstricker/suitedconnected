Stat = function(doc) {
	_.extend(this, doc);
};
_.extend(Stat.prototype, {
	
});
Stats = new Mongo.Collection('stats', {
	transform: function(doc) {
		return new Stat(doc);
	},
});
_.extend(Stats.prototype, {

});