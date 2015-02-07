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

  badgeColor: function() {
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
});
