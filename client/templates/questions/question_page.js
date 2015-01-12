Template.questionPage.helpers({
  ownPost: function() {
    return this.owner == Meteor.userId() || Meteor.user().role == 'administrator';
  }
})