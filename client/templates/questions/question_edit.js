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
Template.questionEdit.events({
  'submit form': function(e) {
    e.preventDefault();

    var currentQuestionId = this._id;

    var questionProperties = {
      id: currentQuestionId,
      title: $(e.target).find('[name=questionTitle]').val(),
      text: $(e.target).find('[name=questionText]').val(),
      tags: $(e.target).find('[name=questionTags]').val()
    }

    Meteor.call("updateQuestion", questionProperties, function(error, id) {
      if (error)
        return alert(error.reason);

      Router.go('questionPage', {_id: id});
    });    

  },

  'click .remove': function(e) {
    e.preventDefault();

    if (confirm("Delete this post?")) {
      Meteor.call("removeQuestion", this._id);
      Router.go('questionsList');
    }
  }
});

Template.questionEdit.rendered = function() {
  //CKEDITOR.replace( 'questionText' );
  $('#questionText').ckeditor();
};