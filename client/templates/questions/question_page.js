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
  },

  createdAt: function() {
    date = new Date(this.createdAt);
    return date.toString();
  }
});

Template.questionPage.events({
  'click .badge': function(e) {
    e.preventDefault();

    Meteor.call("togglePublish", this._id);
  }
});