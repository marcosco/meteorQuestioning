Template.questionPage.helpers({
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
  }
})