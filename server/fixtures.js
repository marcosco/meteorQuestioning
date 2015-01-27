if ( Meteor.users.find().count() === 0 ) {
  adminId = Accounts.createUser({
    username: 'admin',
    emails: {
      address: 'admin@email.local',
    },
    password: 'password',
    profile: {
      first_name: 'Admin',
      last_name: 'User',
    }
  });

  Roles.addUsersToRoles(adminId, 'administrator');
}

if ( Questions.find().count() === 0 ) {
	adminUser = Meteor.users.findOne({"username": "admin"});

  var publishedQuestion =  {
    reply: null,
  	title: "First Question",
  	text: "This is a published question",
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  q1 = Questions.insert(publishedQuestion);

  var aReplyToQuestion =  {
    reply: q1,
    title: "Re: First Question",
    text: "This is a reply to question one",
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  Answers.insert(aReplyToQuestion);

  var unpublishedQuestion =  {
    reply: null,
  	title: "Second Question",
  	text: "This is an unpublished question",
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: null,
    publishedBy: null
  };

  Questions.insert(unpublishedQuestion);
}