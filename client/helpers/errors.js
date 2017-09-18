Errors = new Mongo.Collection(null);

throwError = function(message) {
	Errors.insert({message: message});
};

throwOnError = function(error, result) {
	if(error) {
		throwError(error);
	}
};