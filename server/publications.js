Meteor.publish(null, function (){ 
  return Meteor.roles.find({})
})

Meteor.publish('questions', function() {
  if (Roles.userIsInRole(this.userId, ['publisher','administrator'])) {
      return Questions.find();
    }

  
  return Questions.find( { $or: [{ publishedAt: {$ne: null} }, { owner: this.userId}] });
});

