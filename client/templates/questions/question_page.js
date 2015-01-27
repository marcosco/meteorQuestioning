Template.questionPage.events({
  'click .badge': function(e) {
    e.preventDefault();

    Meteor.call("togglePublish", this._id);
  }
});

Template.questionPage.helpers({
  replies: function() {
    console.log(this._id);
    replies = Answers.find({reply: this._id}, {sort: {createdAt: -1}});
    return replies;
  },

  isPublisher: function () {
    if (Roles.userIsInRole(Meteor.user(), ['publisher'])) {
      return true;      
    } else {
      return false;
    }
  }
});
