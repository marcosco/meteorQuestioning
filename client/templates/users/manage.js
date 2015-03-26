Template.manageUsers.created = function () {

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
    var subscription = Meteor.subscribe('users', limit);

    // if subscription is ready, set limit to newLimit
    if (subscription.ready()) {
      instance.loaded.set(limit);
      instance.ready.set(true);
    } else {
      instance.ready.set(false);
    }
  });

  // 3. Cursor

  instance.users = function() {  
    return Meteor.users.find({}, {limit: instance.loaded.get()});
  }  
};

Template.manageUsers.helpers({
  users: function() {
    return Template.instance().users();
  },
  // the subscription handle
  isReady: function () {
    return Template.instance().ready.get();
  },
  // are there more posts to show?
  hasMoreUsers: function () {
    console.log(Template.instance().users().count());
    return Template.instance().users().count() >= Template.instance().limit.get();
  }
});

Template.userRow.checkPublisher = function (_id) {
  if(Roles.userIsInRole(_id, 'publisher')) {
    return "checked";
  } else{
    return "";
  }    
};

Template.manageUsers.events({
  "change .toggle-publisher input": function (event) {
    Meteor.call('togglePublisher', this._id);
  },
  'click .load-more': function (event, instance) {
    event.preventDefault();

    // get current value for limit, i.e. how many posts are currently displayed
    var limit = instance.limit.get();

    // increase limit by 5 and update it
    limit += 5;
    instance.limit.set(limit);
  },
  'click .impersonate': function() {
    var userId = this._id;
    Meteor.call('impersonate', userId, function(err) {
      if (!err) {
        Meteor.connection.setUserId(userId);
        Router.go('/');
      }
    });
  }  
});