Template.questionsMineList.created = function () {

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
    query = Session.get('srch-term');

    var qlist = Answers.find({owner: Meteor.userId()});
    itemList = qlist.map(function (qlist) {
      return qlist.question_id;
    });

    if (query) {
      filter = new RegExp( query, 'i' );
      return Questions.find({
              $or: [
                {
                  $and: [ 
                    {_id: {$in: itemList}} , 
                    {$or: [
                      {"text": filter},
                      {"title": filter}
                      ]
                    }
                  ]                
                },
                {
                  $and: [ 
                    {owner: Meteor.userId()} , 
                    {$or: [
                      {"text": filter},
                      {"title": filter}
                      ]
                    }
                  ]                
                }
              ]
               },
              {sort: {createdAt: -1}, limit: instance.loaded.get()});
    };    
    return Questions.find({ 
              $or: [
                { owner: Meteor.userId() },
                { _id: {$in: itemList} } 
              ]
              }, 
              {sort: {createdAt: -1}, limit: instance.loaded.get()});
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
    limit += Meteor.settings.public.pageSize;
    instance.limit.set(limit);
  }  
});