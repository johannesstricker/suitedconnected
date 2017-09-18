/** CONVENIENCE HELPERS **/
Template.registerHelper('instance', function() {
	return Template.instance();
});


/** LOOP HELPERS **/
Template.registerHelper('times', function(num) {
	let countArray = [];
	for(let i=0; i < num; i++) {
		countArray.push({});
	}
	return countArray;
});

/** LOGIC HELPERS **/
Template.registerHelper('AND', function(a, b) {
	return a && b;
});
Template.registerHelper('OR', function(a, b) {
	return a || b;
});
Template.registerHelper('ifecho', function(condition, output) {
	return condition && output;
});
Template.registerHelper('ifnotecho', function(condition, output) {
	return !condition && output;
});
Template.registerHelper('equals', function(a, b) {
	return a === b;
});

/** TAG HELPERS **/
Template.registerHelper('getTagIds', function() {
	let tagIds = Session.get('tagIds');
	return Session.get('tagIds');
});


/** ROUTER HELPERS **/
Template.registerHelper('routeNameIs', function(name) {
	return Router.current().route.getName() === name;
});

/** TEXT OUTPUT HELPERS **/
Template.registerHelper('pluralize', function(n, thing) {
	if(n === 1) {
		return '1 ' + thing;
	} else {
		return n + ' ' + thing + 's';
	}
});
Template.registerHelper('capText', function(input, max) {
	if(input.length > max + 3) {
		return input.substring(0, max) + '...';
	}
	return input;
});

Template.registerHelper('roundCurrency', function(number) {
	if(number === 0)
		return number;
	return Math.round(number * 100) / 100;
});

Template.registerHelper('fromNow', function(date) {
	return moment(date).fromNow();
});

Template.registerHelper('formatDate', function(date) {
	return moment(date).format("MMMM Do YYYY");
});
Template.registerHelper('formatDateTime', function(date) {
	return moment(date).format("MMMM Do YYYY, h:mm a");
});

Template.registerHelper('extendContext', function(data) {
  var result = _.clone(this);
  _.each(data.hash, function(value, key) {
    result[key] = value;
  })
  return result;
});

Template.registerHelper('ucfirst', function(string) {
	return string.charAt(0).toUpperCase() + string.substr(1);
});

UI.registerHelper('breaklines', function(text, cap) {
  text = s.escapeHTML(text);
  text = text.replace(/(\r\n|\n|\r)/gm, '<br/>');
  if(cap && text.length > cap + 3) {
  	text = text.substring(0, cap) + '...';
  }
  return new Spacebars.SafeString(text);
});

Template.registerHelper('not', function(bool) {
	return !bool;
});


/** FORM HELPERS **/
Template.registerHelper('errorClass', function(field) {
	return !!(Template.instance().errors instanceof ReactiveVar && Template.instance().errors.get()[field]) ? 'has-error' : '';
});

Template.registerHelper('errorMessage', function(field) {
	if(!Template.instance().errors instanceof ReactiveVar) {
		return null;
	}
	return Template.instance().errors.get()[field];
});
Template.registerHelper('hasErrors', function() {
	return Object.keys(Template.instance().errors.get()).length > 0;
});
Template.registerHelper('getErrors', function() {
	return Template.instance().errors.get();
});
Template.registerHelper('randomString', function(length) {
	length = length === undefined ? 10 : length;
	let text = "";
	let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
});

/** POKER HELPERS **/
Template.registerHelper('cardSuit', function(card) {
	var suit = card[1];
	switch(suit) {
		case 's': return 'spade';
		case 'h': return 'heart';
		case 'd': return 'diamond';
		case 'c': return 'club';
		case '_': return 'blank';
	}
});
Template.registerHelper('cardRank', function(card) {
	if(card[0] === '_') {
		return ' ';
	}
	return card[0];
});
Template.registerHelper('fillWithBlanks', function(cards, length) {
	let copy = _.clone(cards);
	for(let i = cards.length; i < length; i++) {
		copy.push('__');
	}
	return copy;
});