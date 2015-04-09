/*
Questioning is a kind of BB system completely written using MeteorJS that
implements Ann Kerwin's Ignorance Map and a rewarding system to involve users.
Copyright (c) 2015, Author: Marco Scordino, Advisor: Paolo Ceravolo http://www.di.unimi.it/ceravolo/

This file is part of Questioning.

Questioning is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Questioning is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Questioning.  If not, see <http://www.gnu.org/licenses/>.
*/
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
    onBeforeAction: function() {
      if (!Meteor.userId()) {
        this.render('accessDenied');
      } else {
        this.next();
      }
    },    
    waitOn: function() { 
      return [ Meteor.subscribe('questions'), Meteor.subscribe('answers'), Meteor.subscribe('ignorances') ]; 
    },
    path: '/myquestions',
    data: {
      category: "profile"
    }    
  });  

  this.route('myIgnoranceMap', {
    path: '/myignorancemap',
    data: {
      category: "profile"
    },
    waitOn: function() { 
      return [ Meteor.subscribe('questions'), Meteor.subscribe('arguments'), Meteor.subscribe('ignorances') ]; 
    },       
  }); 

  this.route('ignoranceMap', {
    onBeforeAction: function() {
      if (!Roles.userIsInRole(Meteor.userId(), 'administrator')) {
        this.render('accessDenied');
      } else {
        this.next();
      }
    },    
    waitOn: function() { 
      return Meteor.subscribe('arguments'); 
    },    
    path: '/ignorancemap',
    onBeforeAction: function() {
      if (!Meteor.userId()) {
        this.render('accessDenied');
      } else {
        this.next();
      }
    },       
    data: {
      category: "profile"
    }    
  }); 

  this.route('/about', {
    path: 'about'
  });

  this.route('questionPage', {
    onBeforeAction: function() {
      if ( Meteor.user() ) {
        var options = {
          user: Meteor.userId(),
          question: this.params._id,
          action: 'oQ'
        }

        Meteor.call('updateIgnorance', options);
      }

      this.next();
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
    onBeforeAction: function() {
      if (!Meteor.userId()) {
        this.render('accessDenied');
      } else {
        this.next();
      }
    },    
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
    waitOn: function() { 
      return [ Meteor.subscribe('questions'), Meteor.subscribe('arguments'), Meteor.subscribe('ignorances') ];
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