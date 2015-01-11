Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function() {
  this.route('welcome', {path: '/'});
});

Router.route('/about', {name: 'about'});