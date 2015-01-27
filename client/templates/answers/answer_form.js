Template.answerForm.events({
  'submit form': function(e) {
    e.preventDefault();

    var replyProperties = {
      question_id: $(e.target).find('[name=question_id]').val(),
      text: $(e.target).find('[name=replyText]').val()
    }

    Meteor.call("addReply", replyProperties, function(error, id) {
      if (error)
        return alert(error.reason);
    });

    e.target.replyText.value = "";

  },
});

Template.answerForm.rendered = function() {
  //CKEDITOR.replace( 'questionText' );
  $('#replyText').ckeditor();
};