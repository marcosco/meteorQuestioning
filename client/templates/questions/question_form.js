Template.questionForm.events({
  "submit": function (e) {
    var question = {
      title: $(e.target).find('[name=questionTitle]').val(),
      text: $(e.target).find('[name=questionText]').val()
    }
    Meteor.call("addQuestion", question);

    // Clear form
    event.target.questionText.value = "";
    event.target.questionTitle.value = "";

    $('#questionModal').modal('hide');
    console.log(event);

    // Prevent default form submit
    return false;
  }
});