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

    var qlist = Answers.find({
      $or: [
      {owner: Meteor.userId()},
      {changes: {$elemMatch:
        { user: Meteor.userId() }
      }}
      ]});
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
                { _id: {$in: itemList} },
                { changes: {$elemMatch:
                  { user: Meteor.userId() }
                }}
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