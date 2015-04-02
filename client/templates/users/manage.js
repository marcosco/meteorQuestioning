function setGoal(data) {
  console.log(data);
  goal =    ((data.score / 100) * data.uu.percentage) * Meteor.settings.public.goal.modifiers.uu
          + ((data.score / 100) * data.ku.percentage) * Meteor.settings.public.goal.modifiers.ku
          + ((data.score / 100) * data.uk.percentage) * Meteor.settings.public.goal.modifiers.uk
          + ((data.score / 100) * data.de.percentage) * Meteor.settings.public.goal.modifiers.de
          + ((data.score / 100) * data.er.percentage) * Meteor.settings.public.goal.modifiers.er
          + ((data.score / 100) * data.kk.percentage) * Meteor.settings.public.goal.modifiers.kk

  goalAbs = Math.round(goal)

  goalPercentage = Math.round(goalAbs * 100 / Meteor.settings.public.goal.score);

  element = '#' + data.userId + '-' + data.argument + '_Goal';

  pbarDanger = '#' + data.userId + '-progress-danger-' + data.argument;
  pbarWarning = '#' + data.userId + '-progress-warning-' + data.argument;
  pbarOk = '#' + data.userId + '-progress-ok-' + data.argument;

  $(element).html('').append( goalPercentage + '%');

  switch(true) {
    case goalPercentage <= 10:
      bar = goalPercentage;
      $(pbarDanger).attr("aria-valuenow", bar).css('width', bar + '%');
      $(pbarWarning).attr("aria-valuenow", "0").css('width', '0%');
      $(pbarOk).attr("aria-valuenow", "0").css('width', '0%');
      break;
    case goalPercentage > 10 && goalPercentage <= 30:
      bar = goalPercentage - 10;
      $(pbarDanger).attr("aria-valuenow", "10").css('width', '10%');;
      $(pbarWarning).attr("aria-valuenow", bar).css('width', bar + '%');
      $(pbarOk).attr("aria-valuenow", "0").css('width', '0%');;
      break;
    case goalPercentage > 30:
      bar = goalPercentage - 30;
      $(pbarDanger).attr("aria-valuenow", "10").css('width', '10%');;
      $(pbarWarning).attr("aria-valuenow", "20").css('width', '20%');;
      $(pbarOk).attr("aria-valuenow", bar).css('width', bar + '%');
      break;
  }
};

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
    return Template.instance().users().count() >= Template.instance().limit.get();
  },
  interestingTags: function (userId) {
    data = [];
    args = Arguments.find();
    args.forEach(function(arg){
      ele = {};
      ele.argument = arg;
      ele.userId = userId;
      data.push(ele)
    })
    return data;
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

    limit += Meteor.settings.public.pageSize;
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

Template.chart.helpers({

});

Template.chart.rendered = function () {
    //Get the context of the canvas element we want to select
  Meteor.call('getIgnoranceDistributionByUser', this.data.userId, this.data.argument.argument, function (error, result){
    data = {
      userId: result.userId,
      argument: result.argument,
      distribution: {
        uu: {
          absolute: result.uu.absolute,
          percentage: result.uu.percentage,
        },
        ku: {
          absolute: result.ku.absolute,
          percentage: result.ku.percentage,
        },
        er: {
          absolute: result.er.absolute,
          percentage: result.er.percentage,
        },
        de: {
          absolute: result.de.absolute,
          percentage: result.de.percentage,
        },
        uk: {
          absolute: result.uk.absolute,
          percentage: result.uk.percentage,
        },
        kk: {
          absolute: result.kk.absolute,
          percentage: result.kk.percentage,
        }
      }       
    };

    console.log(data);
    setGoal(result);
  });
    //drawChart(item);
};