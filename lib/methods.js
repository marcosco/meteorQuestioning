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

  removeQuestion: function(id) {
    question = Questions.findOne(id);
    if (Meteor.user().role != 'administrator' && Meteor.userId() != question.owner) {
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

  publishQuestion: function(id) {
    question = Questions.findOne(id);
    if (Meteor.user().role != 'administrator' && Meteor.user().role != 'publisher') {
      throw new Meteor.Error("You are not authorized to publish questions!");      
    }

    var publishedAt = new Date().getTime();
    var publishedBy = Meteor.user().username;

    Questions.update(currentQuestionId, {$set: {publishedAt: publishedAt, publishedBy: publishedBy}});
  },

  publishQuestion: function(id) {
    question = Questions.findOne(id);
    if (Meteor.user().role != 'administrator' && Meteor.user().role != 'publisher') {
      throw new Meteor.Error("You are not authorized to unpublish questions!");      
    }

    var publishedAt = null;
    var publishedBy = null;

    Questions.update(currentQuestionId, {$set: {publishedAt: publishedAt, publishedBy: publishedBy}});
  },
  
});