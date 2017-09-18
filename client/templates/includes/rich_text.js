Template.richText.onCreated(function() {
	var instance = this;
	instance.data = instance.data === undefined ? {} : instance.data;
	instance.attributes = [];
	_.each(_.keys(instance.data), function(key) {
		if(key !== 'settings' && key !== 'value') {
			instance.attributes[key] = instance.data[key];
		}
	});
	instance.value = _.has(instance.data, 'value') ? instance.data.value : '';
	instance.settings = _.has(instance.data, 'settings') ? instance.data.settings : {};
});

Template.richText.onRendered(function() {
	var self = this;
	var settings = _.extend({
		minHeight: 150,
		toolbar: [
		    ['style', ['bold', 'italic', 'underline']],
		    // ['font', ['color']],
		    ['insert', ['picture', 'link', 'video']],
		],
		popover: {
		  image: [
		    ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
		    ['remove', ['removeMedia']]
		  ],
		},
		fontNames: ['DINPro-Regular'],
		fontNamesIgnoreCheck: ['DINPro-Regular'],
        fontSize: 14,
		dialogsInBody: true,
		styleWithSpan: true,
		disableDragAndDrop: true,
		colors: [
			['#000000', '#424242', '#636363', '#9C9C94', '#CEC6CE', '#EFEFEF', '#F7F7F7', '#FFFFFF'],
			['#E76363', '#F7AD6B', '#FFD663', '#94BD7B', '#73A5AD', '#6BADDE', '#8C7BC6', '#C67BA5'],
		],
        callbacks: {
            onPaste: function (e) {
                var bufferText = ((e.originalEvent || e).clipboardData || window.clipboardData).getData('Text');
                e.preventDefault();
                // Firefox fix
                setTimeout(function () {
                    document.execCommand('insertText', false, bufferText);
                }, 10);
            },
        },
        hint: {
        	match: /\B@(\w*)$/,
        	search: function(keyword, callback) {
				let subscription = Meteor.subscribe('User.search', keyword, 10, {
					onReady: function() {
						let foundUsers = Meteor.users.find({username: {$regex: '^' + keyword, $options: 'i'}}, {fields: {_id: 1, username: 1}, sort: {username: 1}, limit: 10}).fetch();
						callback(foundUsers);
					}
				});
        	},
        	template: function(item) {
        		return item.username;
        	},
        	content: function(item) {
        		let node = $('<a>').attr('href', '#').attr('class', 'js-mention').attr('data-id', item._id).text('@' + item.username);
        		return node[0];
        	},
        },
	}, self.settings);

	$(document).ready(function() {
		self.summernote = self.$('.summernote');
		self.summernote.summernote(settings);
		self.summernote.summernote('code', self.value);
		_.each(Object.keys(self.attributes), function(key) {
			if(key === 'class') {
				self.summernote.addClass(self.attributes[key]);
			} else {
				self.summernote.attr(key, self.attributes[key]);
			}
		});
	});
});

Template.richText.helpers({

});

Template.richText.events({

});
