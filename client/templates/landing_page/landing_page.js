var scrollDisabled = false;

var pageScroll = function(e, lastScrollPosition) {
	let down = lastScrollPosition + 10 < $(window).scrollTop();
	let up = lastScrollPosition - 10 > $(window).scrollTop();

	if(scrollDisabled)
		return;

	let height = $(window).height();
	let top = $(window).scrollTop();
	let middle = top + height / 2;
	let bottom = middle + $(window).height() / 2;

	let anchors = $('.anchor');
	let visibleAnchor = _.find(anchors, function(anchor) {
		let $anchor = $(anchor);
		return (down && $anchor.offset().top > top + 5 && $anchor.offset().top < bottom - 5)
		|| (up && $anchor.offset().top + $anchor.height() > top + 5 && $anchor.offset().top < top);
	});

	if(visibleAnchor !== undefined) {
		scrollDisabled = true;
		e.preventDefault();
		$('html,body').animate({scrollTop: $(visibleAnchor).offset().top}, 'slow', function() {
			scrollDisabled = false;
		});
	}
};

Template.landingPage.onCreated(function() {
	var instance = this;
	instance.lastScrollPosition = 0;
	instance.accountTemplate = new ReactiveVar('landingPageRegistration');

	// $(window).on('scroll', function(e) {
	// 	pageScroll(e, instance.lastScrollPosition);
	// 	instance.lastScrollPosition = $(window).scrollTop();
	// });
});

Template.landingPage.events({
	'click .js-switch-template': function(e, instance) {
		e.preventDefault();
		let template = $(e.target).attr('data-target-template');
		instance.accountTemplate.set(template);
	},
  'click .js-goto-login': function(e, instance) {
    e.preventDefault();
    let template = $(e.target).attr('data-template');
    instance.accountTemplate.set(template);
    $('body').animate(
      {scrollTop: `${$('#login-or-register').offset().top}px`},
      'slow',
      function focusInput () {
        $('#login-or-register input').first().focus();
      });
  },
	'mousemove .js-move-mouse': function(e, instance) {
		let needle = instance.$('.js-face-direction');
        if(!needle.length || needle.offset().left === 0 || needle.offset().top === 0 || !e.pageX || !e.pageY) {
            return;
        }
		let deltaX = e.pageX - (needle.offset().left + needle.width() / 2);
		let deltaY = e.pageY - (needle.offset().top + needle.height() / 2);
		let angle = -Math.atan2(deltaX, deltaY) * 180 / Math.PI + 180;
		needle.css({'transform': 'translate(-50%, -50%) rotate(' + angle + 'deg)'});
	},
});
