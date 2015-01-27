Template.questionsList.helpers({
  questions: function() {
    return Questions.find({}, {sort: {createdAt: -1}});
  },

  moreResults: function() {
    // If, once the subscription is ready, we have less rows than we
    // asked for, we've got all the rows in the collection.
    return !(Questions.find().count() < Session.get("itemsLimit"));
  }
});

// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
  var threshold, target = $("#showMoreResults");
  if (!target.length) return;

  threshold = $(window).scrollTop() + $(window).height() - target.height() + 60;

  if (target.offset().top < threshold) {
      if (!target.data("visible")) {
          target.data("visible", true);
          Session.set("itemsLimit",
              Session.get("itemsLimit") + ITEMS_INCREMENT);
      }
  } else {
      if (target.data("visible")) {
          target.data("visible", false);
      }
  }       
}
 
// run the above func every time the user scrolls
$(window).scroll(showMoreVisible);