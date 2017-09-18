Template.commentItem.helpers({
	submittedText: function() {
		return this.submitted.toString();
	}
});

Template.commentItem.events({
	'click #upvote': function(e, template) {
		e.preventDefault();
		Meteor.call('Comment.upvote', this._id, function(error, result) {
			if(error) {
				return throwError(error);
			}
		});
	},
	'click .js-delete-comment': function(e, instance) {
		e.preventDefault();
		let commentId = this._id;

		swal({
			title: "Are you sure you want to delete this comment?",
			text: "Type <span class='highlight'>'FOLD'</span> below and click <span class='highlight'>'OK'</span>. Deletion cannot be undone.",
			type: "input",
			showCancelButton: true,
			closeOnConfirm: false,
			animation: 'slide-from-top',
			html: true,
		}, function(input) {
			if(!input || input.toUpperCase() !== 'FOLD')
				return swal.close();		

			Meteor.call('Comment.delete', commentId, function(error, result) {
				if(error) {
					return swal('Error.', error.reason, 'error');
				}
				swal.close();
			});	
		});
	},
});


Template.commentItem.onRendered(function() {
	var instance = this;
	
	/** Initialize image lightbox. **/
	images = instance.$('.body img');
	_.each(images, function(img) {
		let $img = $(img);
		$img.wrap($('<a>', {
			href: $img.attr('src'),
			class: 'js-image-lightbox',
		}));		
	});
	$('.js-image-lightbox').imageLightbox({
		overlay: true,
	});

	/* Add mention links. */
	let mentions = instance.$('.js-mention');
	_.each(mentions, function(mention) {
		mention = $(mention);
		mention.attr('href', Router.routes.profile.path({_id: mention.attr('data-id')}));
	});

	/* Wrap iframes. */
	instance.$('.body iframe').wrap('<div class="flex-video" />');
});
