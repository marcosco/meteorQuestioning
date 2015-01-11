Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { return Meteor.subscribe('questions'); }
});

Router.map(function() {
  this.route('questionsList', {path: '/'});
});

Router.route('/about', {name: 'about'});

Router.onBeforeAction('loading');