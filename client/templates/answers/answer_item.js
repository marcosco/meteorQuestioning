Template.answerItem.helpers({
  ownPost: function() { 
    return this.owner == Meteor.userId();
  },

  ownPostOrAdmin: function() { 
    return this.owner == Meteor.userId() || Roles.userIsInRole(Meteor.userId(), 'administrator');
  },

  createdAt: function() {
    date = new Date(this.createdAt);
    return date.toString();
  },
  isAccepted: function() {
    if(this.is_accepted) {
      return "Accepted";
    } else {
      return "Not Accepted";
    }
  },

  badgeColor: function() {
    if(this.is_accepted) {
      return "#17a103";
    } else {
      return "#777";
    }    
  },

  myIgnorance: function() {
    var poll = {
      userId: Meteor.userId(),
      category: "answer",
      itemId: this._id,
    }

    currentPoll = Polls.findOne(poll);

    if (currentPoll)
      return currentPoll.classification;      
    else
      return false;
  }

});

Template.answerItem.events({
  'click .answer-badge': function(e) {
    e.preventDefault();

    Meteor.call("setAccepted", this._id);
  },

  'click .answer-minus': function(e) {
    e.preventDefault();

    Meteor.call("decAnswerScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  },

  'click .answer-plus': function(e) {
    e.preventDefault();

    Meteor.call("incAnswerScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  },    
});