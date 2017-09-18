/** Checks if the given element is visible in the current viewport. */
var isElementInViewport = function(el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

/* onCreated */
Template.postList.onCreated(function() {
	var instance = this;

	instance.autorun(function() {
		instance.dataContext = Template.currentData();
	});
	instance.tryLoadMore = function() {
		if(instance.dataContext && instance.dataContext.nextPath) {
			Router.go(instance.dataContext.nextPath);
		}
	}

	/* Automatically load more posts on scrolling. */
	$('body').on('scroll.postList', function(e) {
		_.defer(function() {
			var loadMoreBtn = instance.$('#load-more');
			if(loadMoreBtn.length && isElementInViewport(loadMoreBtn)) {
				instance.tryLoadMore();
			}
		}, 1500);
	});
});

Template.postList.onDestroyed(function() {
	$('body').off('scroll.postList');
});

/* Helpers */
Template.postList.helpers({

});

/* Events */
Template.postList.events({
	'click .tag-selectable': function(e, template) {
		let tag = this;
		let tags = Template.currentData().tags && Template.currentData().tags.get();
		let found = false;
		_.each(tags, function(element) {if(element._id === tag._id) found = true;});
		if(!found)
		{
			tags.push(tag);
			Template.currentData().tags.set(tags);
		}
	},
});

/* Animations */
Template.postItemList.onRendered(function() {
	this.find('.post-item')._uihooks = {
		moveElement: function(node, next) {
			var $node = $(node), $next = $(next);
			var oldTop = $node.offset().top;
			var height = $node.outerHeight(true);

			// find all elements between next and node
			var $inBetween = $next.nextUntil(node);
			if($inBetween.length === 0) {
				$inBetween = $node.nextUntil(next);
			}

			// put node in place
			$node.insertBefore(next);

			var newTop = $node.offset().top;

			// move node back to original position
			$node.removeClass('animate').css('top', oldTop - newTop);
			$inBetween.removeClass('animate').css('top', oldTop < newTop ? height : -1 * height);

			// force redraw - browser cant know the actual offset if its not moving the element
			$node.offset();

			$node.addClass('animate').css('top', 0);
			$inBetween.addClass('animate').css('top', 0);
		},
		insertElement: function(node, next) {
			$(node).hide().insertBefore(next).fadeIn();
		},
		removeElement: function(node, next) {
			$(node).fadeOut(function() {
				$(this).remove();
			});
		}
	}
});