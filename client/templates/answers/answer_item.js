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
});
