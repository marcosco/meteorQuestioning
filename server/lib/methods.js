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

    var question = _.extend(_.pick(questionAttr, 'title', 'text'), {
      createdAt: new Date().getTime(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      is_answered: null,
      score: 0,
      tags: questionAttr.tags.split(','),
      publishedAt: null,
      publishedBy: null,
      ignoranceMap: ignoranceMap
    });

    questionId = Questions.insert(question);

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

    if (!Roles.userIsInRole(Meteor.user(), ['publisher'])) {
      throw new Meteor.Error("not-authorized");      
    }

    var ignoranceMap = {
      knownUnknowns: 0,
      unknownUnknowns: 0,
      errors: 0,
      unknownKnowns: 0,
      taboos: 0,
      denials: 0,
      total: 0
    };

    var answer = _.extend(_.pick(answerAttr, 'text', 'question_id'), {
      createdAt: new Date().getTime(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      is_accepted: false,
      score: 0,
      publishedAt: new Date().getTime(),
      publishedBy: Meteor.user().username,
      ignoranceMap: ignoranceMap
    });

    answerId = Answers.insert(answer);

    return answerId;
  },

  removeQuestion: function(id) {
    question = Questions.findOne(id);
    if (!Roles.userIsInRole(Meteor.user(), ['administrator']) && Meteor.userId() != question.owner) {
      throw new Meteor.Error("not-authorized");      
    }

    Questions.remove(id);
  },

  updateQuestion: function (questionAttr) {

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

    Questions.update(currentQuestionId, {$set: {title: questionTitle, text: questionText, tags: questionTags}});

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
    } else {
      Questions.update(question._id, {$set: {publishedAt: publishedAt, publishedBy: publishedBy}});      
    }
  },

  togglePublisher: function(_id) {
    if (! Roles.userIsInRole(Meteor.user(), 'administrator')) {
      throw new Meteor.Error("You are not authorized to update user attributes!");      
    }

    if (! Roles.userIsInRole(_id, 'publisher')) {
      Roles.addUsersToRoles(_id, 'publisher');
      console.log("adding " + _id);
    } else {
      Roles.setUserRoles(_id, []);      
      console.log("removing " +_id);
    }
  },

  updateUserProfile: function(profile) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    user = Meteor.users.update( { _id: Meteor.userId() }, { $set: profile} );
    console.log(profile);
  },

  setAccepted: function(id) {
    answer = Answers.findOne(id);
    question = Questions.findOne(answer.question_id);

    if (!Roles.userIsInRole(Meteor.user(), ['administrator']) && Meteor.userId() != question.owner) {
      throw new Meteor.Error("not-authorized");      
    }

    Answers.update( { _id: answer._id }, {$set: { is_accepted: true }} );
    Questions.update( { _id: question._id }, {$set: { is_answered: answer._id }} );
  },

  decQuestionScore: function(id) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    Questions.update( { _id: id }, {$inc: { score: -1 }} );
  },

  incQuestionScore: function(id) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    Questions.update( { _id: id }, {$inc: { score: 1 }} );
  },

  decAnswerScore: function(id) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    Answers.update( { _id: id }, {$inc: { score: -1 }} );
  },

  incAnswerScore: function(id) {
    if (! Meteor.userId()) {
      throw new Meteor.Error(401, "You are not authorized!");
    }

    Answers.update( { _id: id }, {$inc: { score: 1 }} );
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
    Natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
      console.log("inside 1");
      console.log(classifier.classify(input));
      console.log("inside 2");
      console.log(classifier.getClassifications(input));
    });
    console.log("outside");
  }

});