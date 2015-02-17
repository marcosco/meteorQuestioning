Template.header.helpers({
  activeIfTemplateIs: function (template) {
    var currentRoute = Router.current();
    return currentRoute &&
      template === currentRoute.lookupTemplate() ? 'active' : '';
  }
});

Template.header.events({
'submit form': function(e) {
    e.preventDefault();
    var query = $(e.target).find('[name=srch-term]').val();

    // Log the query for testing
    Session.set('srch-term', query);
    Router.go('questionsList');
  }
});