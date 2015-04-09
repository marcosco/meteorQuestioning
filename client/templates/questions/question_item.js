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
function drawQuestionChart(item) {
  canvas = '#' + item.question +'-chart'

  var data = [
      {
          value: item.ignoranceMap.uu.absolute,
          color: Meteor.settings.public.ignoranceMap.uu.color,
          highlight: Meteor.settings.public.ignoranceMap.uu.highlight,
          label: Meteor.settings.public.ignoranceMap.uu.label
      },
      {
          value: item.ignoranceMap.ku.absolute,
          color: Meteor.settings.public.ignoranceMap.ku.color,
          highlight: Meteor.settings.public.ignoranceMap.ku.highlight,
          label: Meteor.settings.public.ignoranceMap.ku.label
      },
      {
          value: item.ignoranceMap.uk.absolute,
          color: Meteor.settings.public.ignoranceMap.uk.color,
          highlight: Meteor.settings.public.ignoranceMap.uk.highlight,
          label: Meteor.settings.public.ignoranceMap.uk.label
      },
      {
          value: item.ignoranceMap.er.absolute,
          color: Meteor.settings.public.ignoranceMap.er.color,
          highlight: Meteor.settings.public.ignoranceMap.er.highlight,
          label: Meteor.settings.public.ignoranceMap.er.label
      },
      {
          value: item.ignoranceMap.de.absolute,
          color: Meteor.settings.public.ignoranceMap.de.color,
          highlight: Meteor.settings.public.ignoranceMap.de.highlight,
          label: Meteor.settings.public.ignoranceMap.de.label
      },
      {
          value: item.ignoranceMap.kk.absolute,
          color: Meteor.settings.public.ignoranceMap.kk.color,
          highlight: Meteor.settings.public.ignoranceMap.kk.highlight,
          label: Meteor.settings.public.ignoranceMap.kk.label
      }      
  ]

  var ctx = $(canvas).get(0).getContext("2d");
  var myNewChart = new Chart(ctx)
  new Chart(ctx).Pie(data,null);

}

Template.questionItem.rendered = function (){
  console.log(this.data._id);
  Meteor.call('getIgnoranceDistributionByQuestion', this.data._id, function(error, result) {
    drawQuestionChart(result);
  })
};

Template.questionItem.helpers({
  ownPost: function() { 
    return this.owner == Meteor.userId();
  },

  ownPostOrAdmin: function() { 
    return this.owner == Meteor.userId() || Roles.userIsInRole(Meteor.userId(), 'administrator');
  },

  isAdmin: function() { 
    return Roles.userIsInRole(Meteor.userId(), 'administrator');
  },

  isPublished: function() {
    if(this.publishedAt != null) {
      return "Published";
    } else {
      return "Unpublished";
    }
  },

  pubBadgeColor: function() {
    if(this.publishedAt != null) {
      return "#17a103";
    } else {
      return "#777";
    }    
  },

  createdAt: function() {
    date = new Date(this.createdAt);
    return date.toString();
  },

  isPublisher: function () {
    if (Roles.userIsInRole(Meteor.user(), ['publisher'])) {
      return true;      
    } else {
      return false;
    }
  },

  isAnswered: function() {
    if(this.is_answered) {
      return "Answered";
    } else {
      return "Not Answered";
    }
  },

  badgeColor: function() {
    if(this.is_answered) {
      return "#17a103";
    } else {
      return "#777";
    }    
  },

  myIgnorance: function() {
    var poll = {
      userId: Meteor.userId(),
      category: "question",
      itemId: this._id,
    }

    currentPoll = Polls.findOne(poll);

    if (currentPoll)
      return currentPoll.classification;      
    else
      return false;
  },

  currentIgnorance: function() {
    var query = {
      user : Meteor.userId(),
      question: this._id
    }

    ignorance = Ignorances.findOne(query);

    if (typeof(ignorance)==='undefined') {
      ignorance = {
        classification : "Unknown Unknowns",
        score : 0
      }    
    }

    return ignorance;
  },

});
  
Template.questionItem.events({
  'click .question-minus': function(e) {
    e.preventDefault();

    Meteor.call("decQuestionScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  },

  'click .question-plus': function(e) {
    e.preventDefault();

    Meteor.call("incQuestionScore", this._id, function(err){
      if (err) {
        alert(err);
      }
    });
  }  
})