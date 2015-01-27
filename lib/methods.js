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

    var question = _.extend(_.pick(questionAttr, 'title', 'text'), {
      createdAt: new Date().getTime(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      publishedAt: null,
      publishedBy: null
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

    var answer = _.extend(_.pick(answerAttr, 'text', 'question_id'), {
      createdAt: new Date().getTime(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
      publishedAt: new Date().getTime(),
      publishedBy: Meteor.user().username
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

    Questions.update(currentQuestionId, {$set: {title: questionTitle, text: questionText}});

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
  }
});