Template.questionsUnpublishedList.created = function () {

  // 1. Initialization

  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(Meteor.settings.public.pageSize);
  instance.ready = new ReactiveVar(false);

  // 2. Autorun

  // will re-run when the "limit" reactive variables changes
  instance.autorun(function () {

    // get the limit
    var limit = instance.limit.get();

    // subscribe to the posts publication
    var subscription = Meteor.subscribe('questions', limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
      instance.ready.set(true);
    } else {
      instance.ready.set(false);
    }
  });

  // 3. Cursor

  instance.questions = function() {  
    return Questions.find({ publishedAt:  null }, {sort: {createdAt: -1}, limit: instance.loaded.get()});
  }  
};

Template.questionsUnpublishedList.helpers({
  questions: function() {
    return Template.instance().questions();
  },
  // the subscription handle
  isReady: function () {
    return Template.instance().ready.get();
  },
  // are there more posts to show?
  hasMoreQuestions: function () {
    return Template.instance().questions().count() >= Template.instance().limit.get();
  },
});

Template.questionsUnpublishedList.events({
  'click .load-more': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var limit = instance.limit.get();

    // increase limit by 5 and update it
    limit += Meteor.settings.public.pageSize;
    instance.limit.set(limit);
  }  
});