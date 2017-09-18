/** Server **/
if(Meteor.isServer) {
	var ThumbnailStoreS = new FS.Store.S3("small", {
		accessKeyId: Meteor.settings.AWSAccessKeyId,
		secretAccessKey: Meteor.settings.AWSSecretAccessKey,
		bucket: Meteor.settings.AWSBucket,
		folder: "small",
		beforeWrite: function(fileObj) {
			return {
				name: fileObj.meta.name,
				extension: 'png',
				type: 'image/png',
			};
		},
		transformWrite: function(fileObj, readStream, writeStream) {
			gm(readStream, fileObj.name()).resize(25, 25, '^').gravity('Center').crop(25, 25).stream('PNG').pipe(writeStream);
		},
	});
	var ThumbnailStoreL = new FS.Store.S3("large", {
		accessKeyId: Meteor.settings.AWSAccessKeyId,
		secretAccessKey: Meteor.settings.AWSSecretAccessKey,
		bucket: Meteor.settings.AWSBucket,
		folder: "large",
		beforeWrite: function(fileObj) {
			return {
				name: fileObj.meta.name,
				extension: 'png',
				type: 'image/png',
			};
		},
		transformWrite: function(fileObj, readStream, writeStream) {
			gm(readStream, fileObj.name()).resize(100, 100, '^').gravity('Center').crop(100, 100).stream('PNG').pipe(writeStream);
		},
	});

	Thumbnails = new FS.Collection("thumbnails", {
		stores: [ThumbnailStoreS,ThumbnailStoreL],
		filter: {
			allow: {
				contentTypes: ['image/*'],
			},
		},
	});
}

/** Client **/
if(Meteor.isClient) {
	var ThumbnailStoreS = new FS.Store.S3("small", {
		folder: "small",
		beforeWrite: function(fileObj) {
			return {
				name: fileObj.meta.name,
				extension: 'png',
				type: 'image/png',
			};
		},
		transformWrite: function(fileObj, readStream, writeStream) {
			gm(readStream, fileObj.name()).resize(25, 25, '^').gravity('Center').crop(25, 25).stream('PNG').pipe(writeStream);
		},
	});
	var ThumbnailStoreL = new FS.Store.S3("large", {
		folder: "large",
		beforeWrite: function(fileObj) {
			return {
				name: fileObj.meta.name,
				extension: 'png',
				type: 'image/png',
			};
		},
		transformWrite: function(fileObj, readStream, writeStream) {
			gm(readStream, fileObj.name()).resize(100, 100, '^').gravity('Center').crop(100, 100).stream('PNG').pipe(writeStream);
		},
	});

	Thumbnails = new FS.Collection("thumbnails", {
		stores: [ThumbnailStoreS,ThumbnailStoreL],
		filter: {
			allow: {
				contentTypes: ['image/*'],
			},
			onInvalid: function(message) {
				throwError(message);
			},
		},
	});
}


/** Allow rules. **/
var canEdit = function(userId, doc) {
	let meta = doc.meta;
	if(meta.userId) {
		let user = findOrThrow(meta.userId, Meteor.users);
		return user.canEdit(userId);
	} else if(meta.groupId) {
		let group = findOrThrow(meta.groupId, Groups);
		return group.canEdit(userId);
	}
	return false;		
};
Thumbnails.allow({
	insert: canEdit,
	update: canEdit,
	remove: function(userId, doc) {
		return canEdit(userId, doc) && !doc.meta.default;
	},
	download: function(userId) {
		return true;
  	}
});


