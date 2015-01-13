Template.manageUsers.helpers({
  userList: function() {
    return Meteor.users.find();
  },

  checkPublisher: function() {
    return Roles.userIsInRole(this._id, 'publisher');
  }
});

Template.manageUsers.events({
  "change .toggle-publisher input": function (event) {
    Meteor.call('togglePublisher', this._id);
  }
});