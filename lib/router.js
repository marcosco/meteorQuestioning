Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() {
    Meteor.subscribe('answers'); 
    return Meteor.subscribe('questions', Session.get('itemsLimit')); }
});

Router.map(function() {
  this.route('questionsList', {
    path: '/',
    data: {
      test: "test"
    }
  });

  this.route('questionsUnpublishedList', {
    path: '/unpublished'
  });  

  this.route('questionsUnansweredList', {
    path: '/unanswered'
  });  

  this.route('questionsMineList', {
    path: '/myquestions'
  });  

  this.route('/about', {
    path: 'about'
  });

  this.route('questionPage', {
    path: '/questions/:_id',
    data: function() {
     return Questions.findOne(this.params._id);
    }
  });

  this.route('questionEdit', {
    path: '/questions/:_id/edit',
    data: function() { return Questions.findOne(this.params._id); }
  });

  this.route('/users', {
    waitOn: function() { return Meteor.subscribe('users'); },
    name: 'manageUsers',
    onBeforeAction: function() {
      if (!Roles.userIsInRole(Meteor.userId(), 'administrator')) {
        this.render('accessDenied');
      } else {
        this.next();
      }
    }
  });

  this.route('/profile', {
    name: 'userProfile',
  });

});

var requireLogin = function(pause) {
  if (! Meteor.user()) {
    if (Meteor.loggingIn())
      this.render('loading');
    else
      this.render('accessDenied');

    pause();
  }
}

//Router.onBeforeAction(requireLogin, {only: 'questionEdit'});

Router.onBeforeAction('loading');