/** User hooks. */
var getInitials = function(username) {
    if(username.length > 1){
        var nameSplit = username.split(" ");
        if(nameSplit.length === 1) {       
            return nameSplit[0].charAt(0).toUpperCase() + nameSplit[0].charAt(1).toUpperCase();
        } else {
            return nameSplit[0].charAt(0).toUpperCase() + nameSplit[1].charAt(0).toUpperCase();
        }        
    } else if (username.length === 0) {
    	return 'XY';
    }
    return username;
};
var createThumbnail = function(text, filename, meta) {
	gm(100, 100, '#666666').setFormat('png').fill('#FFFFFF').font('DinPro Bold', 50).drawText(0,0,text,'center').toBuffer(Meteor.bindEnvironment(function(error, buffer) {
		if(error) throw error;

		let file = new FS.File();
		file.attachData(buffer, {type: 'image/png'}, function(error) {
			if(error) throw error;
			file.name(filename);
			file.meta = meta;
			Thumbnails.insert(file);
		})
	}));	
}
/** Automatically make the user a member of __PUBLIC__ */
Meteor.users.after.insert(function(userId, doc) {
	Roles.addUsersToRoles(doc._id, ['member'], PUBLIC_GROUP);

	let initials = getInitials(doc.username);
	createThumbnail(initials, doc.username, {userId: doc._id, name: doc.username, default: true});
});

/** Thumbnail hooks. **/
Thumbnails.files.after.insert(function(userId, doc) {
	/* Delete all but the default and new thumbnail. */
	let selector = {_id: {$ne: doc._id}};
	if(doc.meta) {
		selector['meta.userId'] = doc.meta.userId;
		selector['meta.groupId'] = doc.meta.groupId;
		selector['meta.default'] = {$ne: true};
		Thumbnails.remove(selector);		
	}
});

/** Group hooks. */
Groups.after.insert(function(userId, doc) {
	let initials = getInitials(doc.name);
	createThumbnail(initials, doc.name, {groupId: doc._id, name: doc.name, default: true});
});
Groups.after.remove(function(userId, doc) {
	Roles.setUserRoles(doc.members, [], doc._id);
	Posts.mutate.remove({groupId: doc._id});
});

// /** Post hooks. */
// Posts.before.remove(function(userId, doc) {
// 	Comments.mutate.remove({postId: doc._id});
// });

