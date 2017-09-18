/** Encapsulates shared stat functionality. **/
StatMutator = {
	changeHandCount: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {handCount: Math.abs(num)};
		return collection.update(query, projection);
	},
	changePostCount: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {postCount: Math.abs(num)};
		return collection.update(query, projection);
	},
	changeCommentCount: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {commentCount: Math.abs(num)};
		return collection.update(query, projection);
	},
	changeViews: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {views: Math.abs(num)};
		return collection.update(query, projection);		
	},
	changeStack: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {stack: Math.abs(num)};
		return collection.update(query, projection);		
	},
	changeChipsSpent: function(collection, query, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {chipsSpent: Math.abs(num)};
		return collection.update(query, projection);		
	},
	changeTagCount: function(collection, query, tagIds, num /* = 1 */) {
		num = num === undefined ? 1 : num;
		tagIds = _.isString(tagIds) ? [tagIds] : tagIds;
		check(tagIds, [String]);
		check(num, Number);

		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {};
		_.each(tagIds, function(tagId) {
			projection[operator]['tagCounts.' + tagId] = num;			
		});
		return collection.update(query, projection);			
	},	
};

var statQuerySchema = new SimpleSchema({
	num: {
		type: Number,
		defaultValue: 1,
	},
	groupId: {
		type: String,
	},
	userId: {
		type: String,
	},
});

Stats.mutate = {
	changeHandCount: function(num /* = 1 */) {
		return StatMutator.changeHandCount(Stats, {}, num);
	},
	changePostCount: function(num /* = 1 */) {
		return StatMutator.changePostCount(Stats, {}, num);
	},
	changeCommentCount: function(num /* = 1 */) {
		return StatMutator.changeCommentCount(Stats, {}, num);
	},
	changeViews: function(num /* = 1 */) {
		return StatMutator.changeViews(Stats, {}, num);
	},
	changeStack: function(num /* = 1 */) {
		num = num === undefined ? 1 : num;
		check(num, Number);
		let operator = num < 0 ? '$dec' : '$inc';
		let projection = {};
		projection[operator] = {stack: Math.abs(num), chipsSpent: Math.abs(num)};
		return collection.update(query, projection);
	},
	changeTagCount: function(tagIds, num /* = 1 */) {
		return StatMutator.changeTagCount(Stats, {}, tagIds, num);
	},
};