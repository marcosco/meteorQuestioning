Template.manageUsers.helpers({
  userList: function() {
    return Meteor.users.find();
  }
});

Template.userRow.checkPublisher = function (_id) {
  if(Roles.userIsInRole(_id, 'publisher')) {
    return "checked";
  } else{
    return "";
  }    
};

Template.manageUsers.events({
  "change .toggle-publisher input": function (event) {
    console.log("toggling" + this._id);
    Meteor.call('togglePublisher', this._id);
  }
});