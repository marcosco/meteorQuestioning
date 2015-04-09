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
Meteor.startup(function () {  
  Questions._ensureIndex({ "owner": 1});
  Questions._ensureIndex({ "publishedAt": 1});
  Questions._ensureIndex({ "is_answered": 1});

  Polls._ensureIndex({ "userId": 1});

  Answers._ensureIndex({ "questionId": 1});
  Answers._ensureIndex({ "owner": 1});

});

Meteor.publish(null, function (){ 
  return Meteor.roles.find({})
})

Meteor.publish('questions', function(limit) {
  if (Roles.userIsInRole(this.userId, ['publisher','administrator'])) {
      return Questions.find({}, { 
                sort: {
                  createdAt: -1
                },
                limit: limit });
    }
  return Questions.find( { $or: [{ publishedAt: {$ne: null} }, { owner: this.userId}] }, { 
                sort: {
                  createdAt: -1
                },
                limit: limit });
});

Meteor.publish('answers', function() {
  return Answers.find();
});

Meteor.publish('polls', function() {
  return Polls.find();
});

Meteor.publish('users', function(limit) {
  if (Roles.userIsInRole(this.userId, 'administrator')) {
      return Meteor.users.find({}, {limit: limit});
    }

  return Meteor.users.find({_id: this.userId}, {limit: limit});
});

Meteor.publish('arguments', function() {
  return Arguments.find();
});

Meteor.publish('ignorances', function() {
  if (Roles.userIsInRole(this.userId, 'administrator')) {
      return Ignorances.find();
  }
  return Ignorances.find({user: this.userId});
});