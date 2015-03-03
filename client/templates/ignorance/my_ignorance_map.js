Template.myIgnoranceMap.helpers({
  questionsKU: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Known Unknowns"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsUU: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Unknown Unknowns"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsER: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Errors"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsUK: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Unknown Knowns"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsTA: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Taboos"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsDE: function() {
    var polls = Polls.find({userId: Meteor.userId(), category: "question", classification: "Denials"});
    itemList = polls.map(function (poll) {
      return poll.itemId;
    });

    return Questions.find({_id: {$in: itemList}});
  },    
});