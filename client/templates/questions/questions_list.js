Template.questionsList.helpers({
  questions: function() {
    return Questions.find({}, {sort: {createdAt: -1}});
  }
});