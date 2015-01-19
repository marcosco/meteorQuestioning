Template.userProfile.helpers({
  user: function() {
    user = Meteor.users.findOne(Meteor.userId());
    return user;
  },

  checked: function() {
    if(Roles.userIsInRole(Meteor.userId(), 'publisher')) {
      return "checked";
    } else{
      return "";
    }    
  }
});

Template.userProfile.events({
  'submit form': function(e) {
    e.preventDefault();

    var user = {
      emails: {
        address: $(e.target).find('[name=email]').val(),
      },
      profile: {
        first_name: $(e.target).find('[name=first_name]').val(),
        last_name: $(e.target).find('[name=last_name]').val()
      }
    }

    Meteor.call("updateUserProfile", user, function(error, id) {
      if (error)
        return alert(error.reason);
    });    
  },

});