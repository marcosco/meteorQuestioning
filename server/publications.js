Meteor.publish(null, function (){ 
  return Meteor.roles.find({})
})

Meteor.publish('questions', function(limit) {
  if (Roles.userIsInRole(this.userId, ['publisher','administrator'])) {
      return Questions.find({}, { 
                sort: {
                  createdAt: -1
                },
                limit: limit });
    }

  return Questions.find( { $or: [{ publishedAt: {$ne: null} }, { owner: this.userId}] },
      { 
        sort: {
          createdAt: -1
        },
        limit: limit });
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
