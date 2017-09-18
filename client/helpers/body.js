Template.layout.onCreated(function() {
	/** Mouse Over Dropdowns **/
	$('body').on('mouseleave', '.dropdown-hover .dropdown-toggle', function(event) {
		// let $dropdown = $(this);
		let $dropdown = $(this).parents('.dropdown').first();
		$dropdown.removeClass('visible');
		event.stopPropagation();
	});
	$('body').on('mouseleave', '.dropdown-hover .dropdown-content', function(event) {
		// let $dropdown = $(this);
		let $dropdown = $(this).parents('.dropdown').first();
		$dropdown.removeClass('visible');
		event.stopPropagation();
	});
	$('body').on('mouseover', '.dropdown-hover .dropdown-content', function(event) {
		let $dropdown = $(this).parents('.dropdown').first();
		$('.dropdown').removeClass('visible');
		$dropdown.addClass('visible');
		event.stopPropagation();
	});
	$('body').on('mouseover', '.dropdown-hover .dropdown-toggle', function(event) {
		let $dropdown = $(this).parents('.dropdown').first();
		$('.dropdown').removeClass('visible');
		$dropdown.addClass('visible');
		event.stopPropagation();
	});

	/** Clickable Dropdowns **/
	$('body').on('click', '.dropdown-toggle', function(event) {
		let $dropdown = $(this).parents('.dropdown').first();

		if($dropdown.hasClass('dropdown-hover')) {
			event.stopPropagation();
			return;
		}

		$('.dropdown').not($dropdown).removeClass('visible');
		$dropdown.toggleClass('visible');
		event.stopPropagation();
	});
	$('body').click(function(event) {
		/* If target is (child of) dropdown, don't close it. */
		if(
			// !$(event.target).is('.dropdown-content a, .dropdown-content') &&
			$(event.target).is('.dropdown-content *, .dropdown-content')) {
			return;
		}

		/* Close dropdowns. */
		let $dropdownContent = $('.dropdown-content');
		let $dropdown = $dropdownContent.parents('.dropdown').first();
		if($dropdown) {
			$dropdown.removeClass('visible');
		}
	});
});
