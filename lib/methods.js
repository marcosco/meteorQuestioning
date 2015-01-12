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
      username: Meteor.user().username      
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
  }
});