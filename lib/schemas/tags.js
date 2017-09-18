TagsSchema = new SimpleSchema({
	"name": {
		type: String,
		label: "Tag name",
		unique: true
	},
	"description": {
		type: String,
		label: "Tag description",
		defaultValue: "No description available."
	},
	"synonyms": {
		type: [String],
		label: "Tag synonyms",
		minCount: 1,
		autoValue: function() {
			var synonyms = [this.field('name').value];
			if(this.field('synonyms').isSet) {
				synonyms = _.union(synonyms, this.field('synonyms').value);
			}
			return synonyms;
		}
	}
});

Tags.attachSchema(TagsSchema);
