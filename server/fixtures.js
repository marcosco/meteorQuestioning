Meteor.startup(function () {

  function findOrCreateUser(name, admin) {
    if (typeof(name)==='undefined') name = "John Doe";
    if (typeof(admin)==='undefined') admin = false;
    details = name.split(' ');

    firstName = details[0];

    if (details.length == 1) {
      lastName = "Doe";
    } else {
      lastName = details[1];
    }

    username = firstName.concat(lastName);
    email = username + "@email.local";

    user = Meteor.users.findOne({username: username});
    if (typeof(user)==='undefined') {
      userId = Accounts.createUser({
        username: username,
        emails: {
          address: email,
        },
        password: 'password',
        profile: {
          first_name: firstName,
          last_name: lastName,
        }
      });

      if ( admin ) {
        Roles.addUsersToRoles(userId, ['administrator', 'publisher']);
      }

      logger.debug("User " + username + " not found and created as id " + userId);

      user = Meteor.users.findOne({_id: userId});

      return user;      
    }

    logger.debug("User " + username + " found as id " + user._id);

    return user;
  }

  if ( Meteor.users.find().count() === 0 ) {
      findOrCreateUser("adm in", true);
  }

  if ( Questions.find().count() === 0 ) {
  	adminUser = Meteor.users.findOne({"username": "admin"});

    tokenizer = new Natural.WordTokenizer();
    classifier = new Natural.LogisticRegressionClassifier();
    
    function loadSeeds(file) {

      var Questions1 = JSON.parse(Assets.getText(file));

      logger.info("loading " + file);

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

        owner = findOrCreateUser(Question.owner.display_name);

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
          owner: owner._id,
          username: owner.username,
          is_answered: null,
          publishedAt: new Date().getTime(),
          publishedBy: owner.username,
          ignoranceMap: ignoranceMap,
        }

        question_id = Questioning.addQuestion(question);

        try {
          extractedTags = Tags.findFrom(Question.title);

          for (var tt = 0, ttlen = Question.tags.length; tt < ttlen; tt++) {
            classifier.addDocument(extractedTags.join(), Question.tags[tt]);        
          }

  //        classifier.addDocument(extractedTags.join(), Question.tags[0]);
        }
        catch(err) {
          logger.error(err);
          logger.error("This text cause the error: " + Question.title);
        }

        if ( Question.answer_count !== 0 ) {
          var Answers1 = Question.answers;
          for (var k = 0, alen = Answers1.length; k < alen; k++) {
            var Answer = Answers1[k];

            owner = findOrCreateUser(Answer.owner.display_name);

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
              owner: owner._id,
              username: owner.username,
              publishedAt: new Date().getTime(),
              publishedBy: owner.username,
            };

            answer_id = Questioning.addAnswer(answer);

            if ( Answer.is_accepted ) {
              Q = Questions.findOne(question_id);
              A = Answers.findOne(answer_id);
              var options = {
                question: Q,
                answer: A
              }

              Questioning.setAccepted(options);
            }
          }      
        }
      };

    };

    for (var seed = 1; seed <= 1; seed++) {
      loadSeeds("seeds/js-" + seed + ".json");
      loadSeeds("seeds/css-" + seed + ".json");
    }

    classifier.addDocument("Marco Scordino", "daddy"); 
    classifier.train();
    classifier.save('assets/app/classifier.json', function(err, classifier) {
      // the classifier is saved to the classifier.json file!
    });
  }

});