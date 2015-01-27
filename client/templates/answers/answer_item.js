Template.answerItem.helpers({
  createdAt: function() {
    date = new Date(this.createdAt);
    return date.toString();
  },
});
