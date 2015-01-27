Meteor.publish(null, function (){ 
  return Meteor.roles.find({})
})

Meteor.publish('questions', function() {
  if (Roles.userIsInRole(this.userId, ['publisher','administrator'])) {
      return Questions.find();
    }

  return Questions.find( { $or: [{ publishedAt: {$ne: null} }, { owner: this.userId}] });
});

Meteor.publish('answers', function() {
  return Answers.find();
});

Meteor.publish('users', function() {
  if (Roles.userIsInRole(this.userId, 'administrator')) {
      return Meteor.users.find();
    }

  return Meteor.users.find({_id: this.userId});
});
