Template.answerItem.helpers({
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

    Meteor.call("decAnswerScore", this._id);
  },

  'click .answer-plus': function(e) {
    e.preventDefault();

    Meteor.call("incAnswerScore", this._id);
  },

  'click .uk': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Unknown Knowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .ku': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Known Unknowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .uu': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Unknown Unknowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },  

  'click .er': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Errors"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .ta': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Taboos"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .de': function(e) {
    e.preventDefault();

    var poll = {
      category: "answer",
      itemId: this._id,
      classification: "Denials"
    }
    
    Meteor.call("updateIgnorance", poll)
  }      
});