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

    var cssQuestions1 = JSON.parse(Assets.getText(file));

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

    for (var i = 0, len = cssQuestions1.items.length; i < len; i++) {
      var cssQuestion = cssQuestions1.items[i];

      var question = {
        title: Sanitizer(cssQuestion.title),
        text: Sanitizer(cssQuestion.body,
                  { 
                    allowedTags: false,
                    transformTags: {
                      'style': 'pre',
                      'script': 'code'
                    }
                  }),
        score: cssQuestion.score,
        tags: cssQuestion.tags,
        createdAt: new Date().getTime(),
        owner: adminUser._id,
        username: adminUser.username,
        is_answered: null,
        publishedAt: new Date().getTime(),
        publishedBy: adminUser.username,
        ignoranceMap: ignoranceMap,
        vector: tokenizer.tokenize(Sanitizer(cssQuestion.title))
      }

      question_id = Questions.insert(question);

      classifier.addDocument(Sanitizer(cssQuestion.title), cssQuestion.tags[0]);

      if ( cssQuestion.answer_count !== 0 ) {
        var cssAnswers = cssQuestion.answers;
        for (var k = 0, alen = cssAnswers.length; k < alen; k++) {
          var cssAnswer = cssAnswers[k];

          var answer =  {
            question_id: question_id,
            text: Sanitizer(cssAnswer.body, 
                  {
                    allowedTags: false,
                    transformTags: {
                      'style': 'pre',
                      'script': 'code'
                    }
                  }),
            score: cssAnswer.score,
            is_accepted: cssAnswer.is_accepted,
            createdAt: new Date().getTime(),
            owner: adminUser._id,
            username: adminUser.username,
            publishedAt: new Date().getTime(),
            publishedBy: adminUser.username,
            ignoranceMap: ignoranceMap
          };

          answer_id = Answers.insert(answer);

          if ( cssAnswer.is_accepted ) {
            Questions.update( { _id: question_id }, { $set: { is_answered: answer_id } } );
          }
        }      
      }
    };

  };

  loadSeeds("css-q1.json");
  loadSeeds("css-q2.json");
  loadSeeds("css-q3.json");
  loadSeeds("javascript-q1.json");
  loadSeeds("javascript-q2.json");
  loadSeeds("javascript-q3.json");
  loadSeeds("xml-q1.json");
  loadSeeds("xml-q2.json");
  loadSeeds("xml-q3.json");

  classifier.train();
  classifier.save('classifier.json', function(err, classifier) {
    // the classifier is saved to the classifier.json file!
  });

}
