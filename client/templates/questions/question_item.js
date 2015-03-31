Template.questionItem.helpers({
  ownPost: function() { 
    return this.owner == Meteor.userId();
  },

  ownPostOrAdmin: function() { 
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
  },

});
  
Template.questionItem.events({
  'click .question-minus': function(e) {
    e.preventDefault();

    Meteor.call("decQuestionScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  },

  'click .question-plus': function(e) {
    e.preventDefault();

    Meteor.call("incQuestionScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  }  
})