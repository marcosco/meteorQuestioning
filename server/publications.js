Meteor.startup(function () {  
  Questions._ensureIndex({ "owner": 1});
  Questions._ensureIndex({ "publishedAt": 1});
  Questions._ensureIndex({ "is_answered": 1});

  Polls._ensureIndex({ "userId": 1});

  Answers._ensureIndex({ "questionId": 1});
  Answers._ensureIndex({ "owner": 1});

});

Meteor.publish(null, function (){ 
  return Meteor.roles.find({})
})

Meteor.publish('questions', function(limit) {
  if (Roles.userIsInRole(this.userId, ['publisher','administrator'])) {
      return Questions.find({}, { 
                limit: limit });
    }

  return Questions.find( {  publishedAt: {$ne: null} }, { limit: limit });
});

Meteor.publish('answers', function() {
  return Answers.find();
});

Meteor.publish('polls', function() {
  return Polls.find();
});

Meteor.publish('users', function() {
  if (Roles.userIsInRole(this.userId, 'administrator')) {
      return Meteor.users.find();
    }

  return Meteor.users.find({_id: this.userId});
});
