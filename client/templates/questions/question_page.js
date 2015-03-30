Template.questionPage.events({
  'click .question-badge': function(e) {
    e.preventDefault();

    Meteor.call("togglePublish", this._id);
  }
});

Template.questionPage.helpers({
  replies: function() {
    replies = Answers.find({question_id: this._id}, {sort: {createdAt: -1}});
    return replies;
  },

  isPublisher: function () {
    if (Roles.userIsInRole(Meteor.user(), ['publisher'])) {
      return true;      
    } else {
      return false;
    }
  },

  questionClosed: function() {
    return this.is_closed;
  }
});
