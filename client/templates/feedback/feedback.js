Template.feedback.events({
	'click .js-submit, touchend .js-submit': function(e, template) {
		e.preventDefault();
		let $input = $('#feedback');
		let feedback = {
			body: $input.val()
		};
		Meteor.call('Feedback.create', feedback, function(error, result) {
			if(error) {
				return throwError(error.reason);
			}
		});
		$('.feedback').removeClass('visible');
		$input.val('');
		swal("Thank you!", "Your feedback has been sent.", "success");
	},
	'click .js-open-feedback, touchend .js-open-feedback': function(e, instance) {
		e.preventDefault();
		$('.feedback').addClass('visible');
	},
	'click .js-close-feedback, touchend .js-close-feedback': function(e, instance) {
		e.preventDefault();
		$('.feedback').removeClass('visible');
		let $input = $('#feedback');
		$input.val('');
	}
});
