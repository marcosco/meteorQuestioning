Template.questionForm.events({
  "submit": function (event) {
    var question = {
      title: event.target.questionTitle.value,
      text: event.target.questionText.value
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