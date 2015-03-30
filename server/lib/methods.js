Meteor.methods({
  addQuestion: function (questionAttr) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "not-authorized");
    }

    // ensure the post has a title
    if (!questionAttr.title)
      throw new Meteor.Error(422, 'Title is required');

    // ensure the post has a title
    if (!questionAttr.text)
      throw new Meteor.Error(422, 'Text is required');    

    var ignoranceMap = {
      knownUnknowns: 0,
      unknownUnknowns: 0,
      errors: 0,
      unknownKnowns: 0,
      taboos: 0,
      denials: 0,
      total: 0
    };  

    if (Meteor.settings.publishedByDefault) {
      var question = _.extend(_.pick(questionAttr, 'title', 'text'), {
        createdAt: new Date().getTime(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        is_answered: null,
        is_closed: false,
        score: 0,
        tags: questionAttr.tags.split(','),
        publishedAt: new Date().getTime(),
        publishedBy: Meteor.user().username,
        ignoranceMap: ignoranceMap,
        changes: []
      });      
    } else {
      var question = _.extend(_.pick(questionAttr, 'title', 'text'), {
        createdAt: new Date().getTime(),
        owner: Meteor.userId(),
        username: Meteor.user().username,
        is_answered: null,
        is_closed: false,
        score: 0,
        tags: questionAttr.tags.split(','),
        publishedAt: null,
        publishedBy: null,
        ignoranceMap: ignoranceMap,
        changes: []
      });      
    }

    questionId = Questioning.addQuestion(question);

    if (Meteor.settings.autoUpdate) {
      logger.debug("Classifier autoUpdate is on.");
      Questioning.updateClassifier(question);
    }

    return questionId;
  },

  addReply: function (answerAttr) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "not-authorized");
    }

    // ensure the post has a title
    if (!answerAttr.text)
      throw new Meteor.Error(422, 'Text is required');    

    var answer = _.extend(_.pick(answerAttr, 'text', 'question_id'), {
      createdAt: new Date().getTime(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      is_accepted: false,
      score: 0,
      publishedAt: new Date().getTime(),
      publishedBy: Meteor.user().username,
      changes: []

    });

    answerId = Questioning.addAnswer(answer);

    return answerId;
  },

  removeQuestion: function(id) {

    if (Meteor.settings.public.avoidQuestionRemove) {
      throw new Meteor.Error(401, "Administrately not authorized!");
    }

    question = Questions.findOne(id);
    if (!Roles.userIsInRole(Meteor.user(), ['administrator']) && Meteor.userId() != question.owner) {
      throw new Meteor.Error("not-authorized");      
    }

    Questions.remove(id);
    logger.debug("Question " + id + " has been removed.");      
  },

  updateQuestion: function (questionAttr) {

    if (Meteor.settings.public.avoidQuestionUpdate) {
      throw new Meteor.Error(401, "Administrately not authorized!");
    }
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    // ensure the post has a title
    if (!questionAttr.title)
      throw new Meteor.Error(422, 'Title is required');

    // ensure the post has a title
    if (!questionAttr.text)
      throw new Meteor.Error(422, 'Text is required');    

    var questionTitle = questionAttr.title;
    var questionText = questionAttr.text;
    var currentQuestionId = questionAttr.id;
    var questionTags = questionAttr.tags.split(',');

    try {
      Questions.update(currentQuestionId, {$set: {title: questionTitle, text: questionText, tags: questionTags}});
      logger.debug("Question " + currentQuestionId + " has been updated.");      
    }
    catch(err) {
      logger.error(err);
    }

    return currentQuestionId;
  },

  togglePublish: function(id) {
    question = Questions.findOne(id);
    if (! Roles.userIsInRole(Meteor.user(), ['publisher','administrator'])) {
      throw new Meteor.Error("You are not authorized to publish questions!");      
    }

    var publishedAt = new Date().getTime();
    var publishedBy = Meteor.user().username;

    if (question.publishedAt) {
      Questions.update(question._id, {$set: {publishedAt: null, publishedBy: null}});
      logger.debug("Question " + question._id + "is now unpublished");      
    } else {
      Questions.update(question._id, {$set: {publishedAt: publishedAt, publishedBy: publishedBy}});      
      logger.debug("Question " + question._id + "is now published");      
    }
  },

  togglePublisher: function(_id) {
    if (! Roles.userIsInRole(Meteor.user(), 'administrator')) {
      throw new Meteor.Error("You are not authorized to update user attributes!");      
    }

    if (! Roles.userIsInRole(_id, 'publisher')) {
      Roles.addUsersToRoles(_id, 'publisher');
      logger.debug("adding " + _id + " to publisher");
    } else {
      Roles.setUserRoles(_id, []);      
      logger.debug("removing " +_id + " from publisher");
    }
  },

  updateUserProfile: function(profile) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    user = Meteor.users.update( { _id: Meteor.userId() }, { $set: profile} );
    logger.debug(profile + "updated!");
  },

  setAccepted: function(id) {
    answer = Answers.findOne(id);
    question = Questions.findOne(answer.question_id);

    if (!Roles.userIsInRole(Meteor.user(), ['administrator']) && Meteor.userId() != question.owner) {
      throw new Meteor.Error("not-authorized");      
    }

    var options = {
      question: question,
      answer: answer
    }

    Questioning.setAccepted(options);
  },

  decQuestionScore: function(id) {
    q = Questions.findOne(id);

    if (! Meteor.userId() || Meteor.userId() == q.owner ) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    q.changes.forEach(function (change) {
      if (change.user == Meteor.userId()) {
        logger.debug('User ' + Meteor.userId() + ' already vote this item.');
        throw new Meteor.Error(401, "You can vote only once!");
      }
    })

    logger.debug('User ' + Meteor.userId() + ' vote this item.')

    Questions.update( { _id: id }, {$push: {changes: {user: Meteor.userId(), date: new Date().getTime(), action: "Vote minus"}},
                                    $inc: { score: -1 }} );
    logger.debug("Question " + id + " has decrasing score.")

    _.intersection(q.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      var behaviour = {
        user: q.owner,
        owner: q.owner,
        argument: argument,
        question: id,
        action: 'gM'
      }

      Questioning.updateOwnerIgnorance(behaviour);
      Questioning.updateQuestionMap(id);

      var behaviour = {
        user: Meteor.userId(),
        owner: q.owner,
        argument: argument,
        question: id,
        action: 'pM'
      }

      Questioning.updatePartecipantIgnorance(behaviour);
      Questioning.updateQuestionMap(id);

    });
  },

  incQuestionScore: function(id) {
    q = Questions.findOne(id);

    if (! Meteor.userId() || Meteor.userId() == q.owner ) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    q.changes.forEach(function (change) {
      if (change.user == Meteor.userId()) {
        logger.debug('User ' + Meteor.userId() + ' already vote this item.');
        throw new Meteor.Error(401, "You can vote only once!");
      }
    })

    logger.debug('User ' + Meteor.userId() + ' vote this item.')

    Questions.update( { _id: id }, {$push: {changes: {user: Meteor.userId(), date: new Date().getTime(), action: "Vote plus"}},
                                    $inc: { score: 1 }} );
    logger.debug("Question " + id + " has increasing score.")

    _.intersection(q.tags, Meteor.settings.interestingTags).forEach(function(argument) {
      var behaviour = {
        user: q.owner,
        owner: q.owner,
        argument: argument,
        question: id,
        action: 'gP'
      }

      Questioning.updateOwnerIgnorance(behaviour);
      Questioning.updateQuestionMap(id);

      var behaviour = {
        user: Meteor.userId(),
        owner: q.owner,
        argument: argument,
        question: id,
        action: 'pP'
      }

      Questioning.updatePartecipantIgnorance(behaviour);
      Questioning.updateQuestionMap(id);

    });    
  },

  decAnswerScore: function(id) {
    a = Answers.findOne(id);
    q = Questions.findOne(a.question_id);

    if (! Meteor.userId() || Meteor.userId() == a.owner ) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    a.changes.forEach(function (change) {
      if (change.user == Meteor.userId()) {
        logger.debug('User ' + Meteor.userId() + ' already vote this item.');
        throw new Meteor.Error(401, "You can vote only once!");
      }
    })

    Answers.update( { _id: id }, {$push: {changes: {user: Meteor.userId(), date: new Date().getTime(), action: "Vote minus"}},
                                  $inc: { score: -1 }} );
    logger.debug("Answer " + id + " has decreasing score.")

    _.intersection(q.tags, Meteor.settings.interestingTags).forEach(function(argument) {

      var behaviour = {
        user: a.owner,
        owner: q.owner,
        argument: argument,
        question: a.question_id,
        action: 'gM'
      }

      if (a.owner == q.owner) {
        Questioning.updateOwnerIgnorance(behaviour, a.is_accepted);
      } else {
        Questioning.updatePartecipantIgnorance(behaviour, a.is_accepted);
      }
      Questioning.updateQuestionMap(a.question_id);

      var behaviour = {
        user: Meteor.userId(),
        owner: q.owner,
        argument: argument,
        question: a.question_id,
        action: 'pM'
      }

      if (q.owner == Meteor.userId()) {
        Questioning.updateOwnerIgnorance(behaviour, a.is_accepted);  
      } else {
        Questioning.updatePartecipantIgnorance(behaviour, a.is_accepted);        
      }
      Questioning.updateQuestionMap(a.question_id);

    });    
  },

  incAnswerScore: function(id) {
    a = Answers.findOne(id);
    q = Questions.findOne(a.question_id);


    if (! Meteor.userId() || Meteor.userId() == a.owner ) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    a.changes.forEach(function (change) {
      if (change.user == Meteor.userId()) {
        logger.debug('User ' + Meteor.userId() + ' already vote this item.');
        throw new Meteor.Error(401, "You can vote only once!");
      }
    })

    Answers.update( { _id: id }, {$push: {changes: {user: Meteor.userId(), date: new Date().getTime(), action: "Vote plus"}},
                                  $inc: { score: 1 }} );
    logger.debug("Answer " + id + " has incrasing score.")

    _.intersection(q.tags, Meteor.settings.interestingTags).forEach(function(argument) {

      var behaviour = {
        user: a.owner,
        owner: q.owner,
        argument: argument,
        question: a.question_id,
        action: 'gP'
      }

      if (a.owner == q.owner) {
        Questioning.updateOwnerIgnorance(behaviour, a.is_accepted);
      } else {
        Questioning.updatePartecipantIgnorance(behaviour, a.is_accepted);
      }
      Questioning.updateQuestionMap(a.question_id);

      var behaviour = {
        user: Meteor.userId(),
        owner: q.owner,
        argument: argument,
        question: a.question_id,
        action: 'pP'
      }

      if (q.owner == Meteor.userId()) {
        Questioning.updateOwnerIgnorance(behaviour, a.is_accepted);  
      } else {
        Questioning.updatePartecipantIgnorance(behaviour, a.is_accepted);        
      }
      Questioning.updateQuestionMap(a.question_id);

    });        
  },

  updateIgnorance: function (ignoranceAttr) {

    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    if (!ignoranceAttr.category)
      throw new Meteor.Error(422, 'Category is required');

    if (!ignoranceAttr.classification)
      throw new Meteor.Error(422, 'Classification is required');    

    if (!ignoranceAttr.itemId)
      throw new Meteor.Error(422, 'Item ID is required');    

    var userId = Meteor.userId();
    var category = ignoranceAttr.category;
    var itemId = ignoranceAttr.itemId;
    var classification = ignoranceAttr.classification;

    var poll = {
      userId: userId,
      category: category,
      itemId: itemId,
      classification: classification
    }

    currentPollId = Polls.insert(poll);

    if (category == "question") {
      switch (classification) {
        case "Unknown Unknowns":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.unknownUnknowns": 1 }} );
          break;
        case "Unknown Knowns":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.unknownKnowns": 1 }} );
          break;
        case "Known Unknowns":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.knownUnknowns": 1 }} );
          break;
        case "Errors":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.errors": 1 }} );
          break;
        case "Denials":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.denials": 1 }} );
          break;
        case "Taboos":
          Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.taboos": 1 }} );
          break;
      }
      Questions.update( { _id: itemId }, {$inc: { "ignoranceMap.total": 1 }} );
    } else {
      switch (classification) {
        case "Unknown Unknowns":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.unknownUnknowns": 1 }} );
          break;
        case "Unknown Knowns":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.unknownKnowns": 1 }} );
          break;
        case "Known Unknowns":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.knownUnknowns": 1 }} );
          break;
        case "Errors":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.errors": 1 }} );
          break;
        case "Denials":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.denials": 1 }} );
          break;
        case "Taboos":
          Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.taboos": 1 }} );
          break;
      }
      Answers.update( { _id: itemId }, {$inc: { "ignoranceMap.total": 1 }} );      
    }
    return currentPollId;
  },

  classify: function(input) {
    Future = Npm.require('fibers/future');
    logger.debug("Classifying " + input);
    var fut = new Future();

    try {
        Natural.LogisticRegressionClassifier.load('assets/app/classifier.json', null, function(err, classifier) {
            if (err) {
              return logger.error(err);
            }

            prevValue = 1;
            prevDistance = 1;

            if (classifier) {
              allClass = classifier.getClassifications(input);

              suggestions = [];

              for (var i=0; i < allClass.length; i++) {
                label = allClass[i]['label'];
                value = allClass[i]['value'];
                if (value <= 0.5 )
                  break;

                distance = prevValue - value;
                if (distance > prevDistance)
                  break;

                prevDistance = distance;
                prevValue = value;

                logger.debug("label " + label + " has value " + value + " and distance " + distance);

                suggestions.push(label);
              }

              return fut.return(suggestions);
            }

            return fut.return();
          });

        return fut.wait();
    }
    catch(err) {
      logger.error(err);
      logger.debug("This text cause the error: " + Question.title);
    }

  },

  impersonate: function(userId) {
    check(userId, String);

    if (!Meteor.users.findOne(userId))
      throw new Meteor.Error(404, 'User not found');
    if (!Roles.userIsInRole(Meteor.user(), ['administrator']))
      throw new Meteor.Error(403, 'Permission denied');

    logger.info("impersonating " + userId);
    this.setUserId(userId);
  },

  getMyIgnorance: function(query) {
    return Questioning.getIgnorance(query);
  },

  getIgnoranceDistributionByQuestion: function(question_id) {
    return Questioning.getIgnoranceDistributionByQuestion(question_id);
  },  

  getIgnoranceDistributionByUser: function(user_id, argument) {
    return Questioning.getIgnoranceDistributionByUser(user_id, argument);
  },  

  updateIgnorance: function(options) {
    Questioning.updateIgnorance(options);
  },

  getInterestingTags: function() {
    return Meteor.settings.interestingTags;
  }

});