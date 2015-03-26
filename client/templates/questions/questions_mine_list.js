Template.questionsMineList.created = function () {

  // 1. Initialization

  var instance = this;

  // initialize the reactive variables
  instance.loaded = new ReactiveVar(0);
  instance.limit = new ReactiveVar(5);
  instance.ready = new ReactiveVar(false);

  // 2. Autorun

  // will re-run when the "limit" reactive variables changes
  instance.autorun(function () {

    // get the limit
    var limit = instance.limit.get();

    console.log("Asking for "+limit+" questions...")

    // subscribe to the posts publication
    var subscription = Meteor.subscribe('questions', limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      console.log("> Received "+limit+" questions. \n\n")
      instance.loaded.set(limit);
      instance.ready.set(true);
    } else {
      instance.ready.set(false);
      console.log("> Subscription is not ready yet. \n\n");
    }
  });

  // 3. Cursor

  instance.questions = function() { 
    query = Session.get('srch-term');
    if (query) {
      filter = new RegExp( query, 'i' );
      return Questions.find({$and: [ {owner: Meteor.userId()} , {$or: [{"text": filter},{"title": filter}]}] }, {sort: {createdAt: -1}, limit: instance.loaded.get()});
    };    
    return Questions.find({ owner: Meteor.userId() }, {sort: {createdAt: -1}, limit: instance.loaded.get()});
  }  
};

Template.questionsMineList.helpers({
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

Template.questionsMineList.events({
  'click .load-more': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var limit = instance.limit.get();

    // increase limit by 5 and update it
    limit += 5;
    instance.limit.set(limit);
  }  
});