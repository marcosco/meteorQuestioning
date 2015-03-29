Template.questionItem.helpers({
  ownPost: function() {
    return this.owner == Meteor.userId() || Roles.userIsInRole(Meteor.userId(), 'administrator');
  },

  isPublished: function() {
    if(this.publishedAt != null) {
      return "Published";
    } else {
      return "Unpublished";
    }
  },

  pubBadgeColor: function() {
    if(this.publishedAt != null) {
      return "#17a103";
    } else {
      return "#777";
    }    
  },

  createdAt: function() {
    date = new Date(this.createdAt);
    return date.toString();
  },

  isPublisher: function () {
    if (Roles.userIsInRole(Meteor.user(), ['publisher'])) {
      return true;      
    } else {
      return false;
    }
  },

  isAnswered: function() {
    if(this.is_answered) {
      return "Answered";
    } else {
      return "Not Answered";
    }
  },

  badgeColor: function() {
    if(this.is_answered) {
      return "#17a103";
    } else {
      return "#777";
    }    
  },

  myIgnorance: function() {
    var poll = {
      userId: Meteor.userId(),
      category: "question",
      itemId: this._id,
    }

    currentPoll = Polls.findOne(poll);

    if (currentPoll)
      return currentPoll.classification;      
    else
      return false;
  },

  currentIgnorance: function() {
    var query = {
      user : Meteor.userId(),
      question: this._id
    }

    ignorance = Ignorances.findOne(query);

    if (typeof(ignorance)==='undefined') {
      ignorance = {
        classification : "Unknown Unknowns",
        score : 0
      }    
    }

    return ignorance;
  }
});
  
Template.questionItem.events({
  'click .question-minus': function(e) {
    e.preventDefault();

    Meteor.call("decQuestionScore", this._id);
  },

  'click .question-plus': function(e) {
    e.preventDefault();

    Meteor.call("incQuestionScore", this._id);
  },

  'click .uk': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Unknown Knowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .ku': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Known Unknowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .uu': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Unknown Unknowns"
    }
    
    Meteor.call("updateIgnorance", poll)
  },  

  'click .er': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Errors"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .ta': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Taboos"
    }
    
    Meteor.call("updateIgnorance", poll)
  },

  'click .de': function(e) {
    e.preventDefault();

    var poll = {
      category: "question",
      itemId: this._id,
      classification: "Denials"
    }
    
    Meteor.call("updateIgnorance", poll)
  }  
})