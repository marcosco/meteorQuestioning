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
    console.log($("#questionTitleModal").val());

    Meteor.call('classify', $("#questionTitleModal").val(), function (error, result) {
     $("#questionTagsModal").val(result); });
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