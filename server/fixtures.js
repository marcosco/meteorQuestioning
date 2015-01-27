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
  	title: "First Question",
  	text: "This is a published question",
    score: 17,
    tags: [ "html", "css" ],
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  q1 = Questions.insert(publishedQuestion);

  var firstReplyToQuestion =  {
    question_id: q1,
    text: "Unaccepted",
    score: 0,
    is_accepted: false,
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  Answers.insert(firstReplyToQuestion);

  var secondReplyToQuestion =  {
    question_id: q1,
    text: "Accepted",
    score: 10,
    is_accepted: true,
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  Answers.insert(secondReplyToQuestion);

}