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
Template.questionReply.events({
  'submit form': function(e) {
    e.preventDefault();

    var replyProperties = {
      reply: $(e.target).find('[name=replyId]').val(),
      title: "Re: " + $(e.target).find('[name=replyTitle]').val(),
      text: $(e.target).find('[name=replyText]').val()
    }

    Meteor.call("addReply", replyProperties, function(error, id) {
      if (error)
        return alert(error.reason);
    });

    e.target.replyText.value = "";

  },
});

Template.questionReply.rendered = function() {
  //CKEDITOR.replace( 'questionText' );
  $('#replyText').ckeditor();
};