tryUserId = function() {
	let userId = 0;
	try {
		userId = Meteor.userId();
	} catch(error) {
		// do nothing
	}
	return userId;
}

tryUserName = function() {
	let username = '';
	try {
		username = Meteor.user().username;
	} catch(error) {
		// do nothing
	}
	return username;
}

findOrThrow = function(_id, collection) {
	if(collection === undefined) {
		throw new Meteor.Error(500, 'Internal server error.');
	}
	let result = collection.findOne(_id);
	if(!result) {
		throw new Meteor.Error(404, 'Entity not found in collection\'' + collection._name + '\'.');
	}
	return result;
}

if(Array.prototype.equals) {
	console.warn("Overriding existing Array.prototype.equals.");
}
Array.prototype.equals = function(array) {
	if(!array) {
		return false;
	}
	if(this.length !== array.length) {
		return false;
	}
	for(let i=0, l=this.length; i<l; i++) {
		if(this[i] instanceof Array && array[i] instanceof Array) {
			if(!this[i].equals(array[i])) {
				return false;
			}
		} else if (this[i] != array[i]) {
			return false;
		}
	}
	return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});