Tags = new Mongo.Collection('tags');
_.extend(Tags, {
	/** Returns all tags that have a name or synonym matching the keyword and are not excluded. */
	search: function(keyword, excludedIds) {
		if(keyword === '') {
			keyword = '!'; // hack to prevent a match on all tags when provided an empty search
		}
		let regex = new RegExp(keyword, 'i');
		return Tags.find({$or: [{name: regex}, {synonyms: regex}], _id: {$ne: excludedIds}});
	},
});