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
      category: "questions"
    }
  });

  this.route('questionsUnpublishedList', {
    path: '/unpublished',
    data: {
      category: "questions"
    }
  });  

  this.route('questionsUnansweredList', {
    path: '/unanswered',
    data: {
      category: "questions"
    }
  });  

  this.route('questionsMineList', {
    path: '/myquestions',
    data: {
      category: "profile"
    }    
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
    },
    data: {
      category: "profile"
    }    
  });

  this.route('/profile', {
    name: 'userProfile',
    data: {
      category: "profile"
    }    
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