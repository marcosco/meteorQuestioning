Template.questionPage.events({
  "click #delete": function (event) {
    Meteor.call("removeQuestion", this._id);

    Router.go('/');
  }
});