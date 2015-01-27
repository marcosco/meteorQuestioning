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

  var cssQuestions1 = JSON.parse(Assets.getText("css-q1.json"));

  console.log(cssQuestions1.items.length);

  for (var i = 0, len = cssQuestions1.items.length; i < len; i++) {
    var cssQuestion = cssQuestions1.items[i];

    console.log(i);
    console.log(len);

    var question = {
      title: cssQuestion.title,
      text: cssQuestion.body,
      score: cssQuestion.score,
      tags: cssQuestion.tags,
      createdAt: new Date().getTime(),
      owner: adminUser._id,
      username: adminUser.username,
      publishedAt: new Date().getTime(),
      publishedBy: adminUser.username     
    }

    question_id = Questions.insert(question);

    if ( cssQuestion.answer_count !== 0 ) {
      var cssAnswers = cssQuestion.answers;
      for (var k = 0, alen = cssAnswers.length; k < alen; k++) {
        var cssAnswer = cssAnswers[k];

        var answer =  {
          question_id: question_id,
          text: cssAnswer.body,
          score: cssAnswer.score,
          is_accepted: cssAnswer.is_accepted,
          createdAt: new Date().getTime(),
          owner: adminUser._id,
          username: adminUser.username,
          publishedAt: new Date().getTime(),
          publishedBy: adminUser.username
        };

        Answers.insert(answer);
      }      
    }
  }
}