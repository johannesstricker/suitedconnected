Meteor.methods({
	'Feedback.create': function(feedback) {
		check(Meteor.userId(), String);
		check(feedback, {
			body: String
		});

		if(Meteor.isServer) {
			let result = Mandrill.messages.sendTemplate({
				template_name: 'feedback',
				template_content: [
					// no template content
				],
				message: {
					subject: '[suitedconnected] ' + Meteor.user().username + ' has left feedback.',
					from_email: 'feedback@suitedconnected.com',
					to: [
						{email: 'feedback@suitedconnected.com'}
					],
					global_merge_vars: [
						{
							name: 'BODY',
							content: feedback.body.replace(/(\r\n|\n|\r)/gm, '<br/>')
						},
						{
							name: 'USERNAME',
							content: Meteor.user().username
						},
						{
							name: 'REPLY_TO',
							content: Meteor.user().emails[0].address
						}
					],
					merge_vars: [
						// no local merge vars
					]
				}
			});
		}
	},
});