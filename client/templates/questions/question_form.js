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
Template.questionForm.events({
  "submit": function (e) {
    e.preventDefault();

    var question = {
      title: $("#questionTitleModal").val(),
      text: $("#questionTextModal").val(),
      tags: $("#questionTagsModal").val()
    }
    // Clear form
    $("#questionTitleModal").val('');
    CKEDITOR.instances['questionTextModal'].setData('');
    $("#questionTagsModal").val('');

    $('#questionModal').modal('hide');
    Meteor.call("addQuestion", question, function(error, id) {
      if (error)
        return alert(error.reason);

      Router.go('questionPage', {_id: id});
    });

  },

  "change #questionTitleModal": function (e) {
    e.preventDefault();

    Meteor.call('classify', $("#questionTitleModal").val(), function (error, result) {
     $("#questionTagsModal").val(result.join()); });
  }
});

Template.questionForm.rendered = function() {

  CKEDITOR.replace( 'questionTextModal');

  $.fn.modal.Constructor.prototype.enforceFocus = function () {
      var $modalElement = this.$element;
      $(document).on('focusin.modal', function (e) {
          var $parent = $(e.target.parentNode);
          if ($modalElement[0] !== e.target && !$modalElement.has(e.target).length
              // add whatever conditions you need here:
              &&
              !$parent.hasClass('cke_dialog_ui_input_select')
              &&
              !$parent.hasClass('cke_dialog_ui_input_text')
              &&
              !$parent.hasClass('cke_dialog_ui_input_textarea')              
              ) {
              $modalElement.focus()
          }
      })
  };
};