Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
});

Router.map(function() {
  this.route('questionsList', {
    waitOn: function() {
      return Meteor.subscribe('ignorances');
    },
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
    waitOn: function() { 
      return Meteor.subscribe('questions'); 
    },
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

  this.route('myIgnoranceMap', {
    path: '/myignorancemap',
    data: {
      category: "profile"
    }    
  }); 

  this.route('/about', {
    path: 'about'
  });

  this.route('questionPage', {
    onAfterAction: function() {
      if (! Meteor.user()) {
        return true
      }
      var options = {
        user: Meteor.userId(),
        question: this.params._id,
        action: 'oQ'
      }

      Meteor.call('updateIgnorance', options);

      return true;
    },
    waitOn: function() {
      return [ Meteor.subscribe('questions'), Meteor.subscribe('polls'), Meteor.subscribe('answers'), Meteor.subscribe('ignorances')  ];  
    },
    path: '/questions/:_id',
    data: function() {
     return Questions.findOne(this.params._id);
    }
  });

  this.route('questionEdit', {
    waitOn: function() { 
      return [ Meteor.subscribe('questions'), Meteor.subscribe('polls'), Meteor.subscribe('answers') ];  
    },
    path: '/questions/:_id/edit',
    data: function() { return Questions.findOne(this.params._id); }
  });

  this.route('/users', {
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