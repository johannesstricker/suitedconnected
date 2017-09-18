Template.myPosts.helpers({
    'groupIds': function() {
        let groupIds = [PUBLIC_GROUP];
        if(Meteor.user()) {
            groupIds = _.union(groupIds, _.pluck(Meteor.user().findGroups().fetch(), '_id'));
        }
        return groupIds;
    }
});