Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('questions'); }
});

Router.map(function() {
  this.route('questionsList', {path: '/'});

  this.route('/about', {name: 'about'});

  this.route('questionPage', {
    path: '/questions/:_id',
    data: function() { return Questions.findOne(this.params._id); }
  });

  this.route('questionEdit', {
    path: '/questions/:_id/edit',
    data: function() { return Questions.findOne(this.params._id); }
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