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