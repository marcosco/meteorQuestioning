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

  Roles.addUsersToRoles(adminId, ['administrator', 'publisher']);
}

if ( Questions.find().count() === 0 ) {
	adminUser = Meteor.users.findOne({"username": "admin"});

  tokenizer = new Natural.WordTokenizer();

  classifier = new Natural.BayesClassifier();

  function loadSeeds(file) {

    var Questions1 = JSON.parse(Assets.getText(file));

    console.log("loading " + file);

    var ignoranceMap = {
      knownUnknowns: 0,
      unknownUnknowns: 0,
      errors: 0,
      unknownKnowns: 0,
      taboos: 0,
      denials: 0,
      total: 0
    };  

    for (var i = 0, len = Questions1.items.length; i < len; i++) {
      var Question = Questions1.items[i];

      var question = {
        title: Sanitizer(Question.title),
        text: Sanitizer(Question.body,
                  { 
                    allowedTags: false,
                    transformTags: {
                      'style': 'pre',
                      'script': 'code'
                    }
                  }),
        score: Question.score,
        tags: Question.tags,
        createdAt: new Date().getTime(),
        owner: adminUser._id,
        username: adminUser.username,
        is_answered: null,
        publishedAt: new Date().getTime(),
        publishedBy: adminUser.username,
        ignoranceMap: ignoranceMap,
      }

      question_id = Questions.insert(question);

      classifier.addDocument(Sanitizer(Question.title), Question.tags[0]);

      if ( Question.answer_count !== 0 ) {
        var Answers1 = Question.answers;
        for (var k = 0, alen = Answers1.length; k < alen; k++) {
          var Answer = Answers1[k];

          var answer =  {
            question_id: question_id,
            text: Sanitizer(Answer.body, 
                  {
                    allowedTags: false,
                    transformTags: {
                      'style': 'pre',
                      'script': 'code'
                    }
                  }),
            score: Answer.score,
            is_accepted: Answer.is_accepted,
            createdAt: new Date().getTime(),
            owner: adminUser._id,
            username: adminUser.username,
            publishedAt: new Date().getTime(),
            publishedBy: adminUser.username,
          };

          answer_id = Answers.insert(answer);

          if ( Answer.is_accepted ) {
            Questions.update( { _id: question_id }, { $set: { is_answered: answer_id } } );
          }
        }      
      }
    };

  };

  for (var seed = 1; seed < 23; seed++) {
    loadSeeds("seeds/js-" + seed + ".json");
    loadSeeds("seeds/css-" + seed + ".json");
  }


  classifier.train();
  classifier.save('classifier.json', function(err, classifier) {
    // the classifier is saved to the classifier.json file!
  });

}
