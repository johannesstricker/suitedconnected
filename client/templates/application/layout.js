var uiHooks = {
	insertElement: function(node, next) {
		$(node).hide().insertBefore(next);

		setTimeout(function() { $(node).fadeIn(200); }, 200);
	},
	removeElement: function(node) {
		$(node).fadeOut(200, function() {
			$(this).remove();
		});
	},
	// moveElement: function(node, next) {
	// 	var $node = $(node).addClass('animated fadeHeightIn');
	// },
};

var stickIt = function(stickySidebar, stickyHeight)
{
	if (stickySidebar.length > 0)
	{
		// stickySidebar = stickySidebar[0];
		let rect = stickySidebar[0].getBoundingClientRect();
		let viewportBottom = (window.innerHeight || document.documentElement.clientHeight);
		let sidebarTop = rect.top;
		let sidebarBottom = rect.bottom;
		let scrollTop = -sidebarTop;

		let effectiveSidebarHeight = rect.bottom - rect.top - scrollTop;
		let bottomOverlap = effectiveSidebarHeight > viewportBottom ? effectiveSidebarHeight - viewportBottom : 0;

		if(scrollTop > 0)
		{
			stickySidebar.css('padding-top', scrollTop);
		} else {
			stickySidebar.css('padding-top', 0);
		}
	}
}

Template.layout.onRendered(function() {
	var stickySidebar = $('#sidebar');
	if (stickySidebar.length > 0) {
	  var stickyHeight = stickySidebar.height();
	}

	// on scroll move the sidebar
	$('body').on('scroll.sticky', function ()
	{
		stickIt(stickySidebar, stickyHeight);
	});
	// on resize update
	$('body').on('resize.sticky', function () {
		if (stickySidebar.length > 0) {
			stickyHeight = stickySidebar.height();
			stickIt(stickySidebar, stickyHeight);
		}
	});
});

Template.layout.helpers({
	getAccountDropdownTemplate: function() {
	    if(Meteor.user()) {
	        return 'profileDropdown';
	    }
	    if(Meteor.loggingIn()) {
	        return 'spinner';
	    }
	    return 'authenticationDropdown';
	},
	sidebarTitle: function() {
	    const instance = Template.instance();
	    if(Template.currentData() && Template.currentData().group) {
	        return Template.currentData().group.name;
	    }
	    return 'suitedconnected';
	},
})

/** Returns the height of the scrollbar (if visible) of element. **/
const getScrollbarWidth = (element) => {
  return element[0].offsetWidth - element[0].clientWidth;
};

Template.layout.onRendered(function() {
	$('.header-container').css('padding-right', getScrollbarWidth($('body')) + 'px');
	$('.header-background').css('padding-right', getScrollbarWidth($('body')) + 'px');
});