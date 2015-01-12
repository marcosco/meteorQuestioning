Template.questionForm.events({
  "submit": function (e) {
    e.preventDefault();

    var question = {
      title: $(e.target).find('[name=questionTitle]').val(),
      text: $(e.target).find('[name=questionText]').val()
    }
    Meteor.call("addQuestion", question, function(error, id) {
      if (error)
        return alert(error.reason);

      Router.go('questionPage', {_id: id});
    });

    // Clear form
    e.target.questionText.value = "";
    e.target.questionTitle.value = "";

    $('#questionModal').modal('hide');
  }
});