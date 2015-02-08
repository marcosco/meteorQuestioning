Template.questionForm.events({
  "submit": function (e) {
    e.preventDefault();

    var question = {
      title: $(e.target).find('[name=questionTitleModal]').val(),
      text: $(e.target).find('[name=questionTextModal]').val(),
      tags: $(e.target).find('[name=questionTagsModal]').val()
    }
    Meteor.call("addQuestion", question, function(error, id) {
      if (error)
        return alert(error.reason);

      Router.go('questionPage', {_id: id});
    });

    // Clear form
    e.target.questionTextModal.value = "";
    e.target.questionTitleModal.value = "";

    $('#questionModal').modal('hide');
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