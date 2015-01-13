if ( Meteor.users.find().count() === 0 ) {
  adminId = Accounts.createUser({
    username: 'admin',
    email: 'admin@email.local',
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
    createdAt: new Date().getTime(),
    owner: adminUser._id,
    username: adminUser.username,
    publishedAt: new Date().getTime(),
    publishedBy: adminUser.username
  };

  Questions.insert(publishedQuestion);

  var unpublishedQuestion =  {
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