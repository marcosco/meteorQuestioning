Template.answerForm.events({
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

Template.answerForm.rendered = function() {
  //CKEDITOR.replace( 'questionText' );
  $('#replyText').ckeditor();
};