Template.questionsList.helpers({
  questions: function() {
    return Questions.find({reply: null}, {sort: {createdAt: -1}});
  }
});