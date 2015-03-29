function drawChart(item) {
  canvas = '#' + item.argument +'_Chart'

  var data = [
      {
          value: item.distribution.uu.absolute,
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "Unknown Unknowns"
      },
      {
          value: item.distribution.uk.absolute,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Unknown Knowns"
      },
      {
          value: item.distribution.er.absolute,
          color: "#FDB45C",
          highlight: "#FFC870",
          label: "Errors"
      },
      {
          value: item.distribution.de.absolute,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Denials"
      },
      {
          value: item.distribution.kk.absolute,
          color: "#FDB45C",
          highlight: "#FFC870",
          label: "Known Knowns"
      }      
  ]

  var ctx = $(canvas).get(0).getContext("2d");
  var myNewChart = new Chart(ctx)
  new Chart(ctx).Pie(data,null);

}
Template.myIgnoranceRow.rendered = function () {
    //Get the context of the canvas element we want to select
  Arguments.find().forEach(function (item){
    //drawChart(item);
  })
};

Template.myIgnoranceMap.helpers({
  interestingTags: function () {
    return Arguments.find();
  },
});

Template.myIgnoranceRow.helpers({
  chart: function() {
    canvasId = this.argument + "_Chart";
    return canvasId;
  },

  interestingTags: function () {
    return Arguments.find();
  },

  questionsKU: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), classification: 'Known Unknowns'});
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsUU: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), $or: [
                                                  { classification: "Known Unknowns"},
                                                  { classification: "Errors"},
                                                  { classification: "Unknown Knowns"},
                                                  { classification: "Known Knowns"},
                                                  { classification: "Denials"}]
                                                });
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$nin: itemList}, tags: this.argument});
  },

  questionsER: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), classification: 'Errors'});
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsUK: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), classification: 'Unknown Knowns'});
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsKK: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), classification: 'Known Knowns'});
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$in: itemList}});
  },

  questionsDE: function() {
    var qlist = Ignorances.find({argument: this.argument, user: Meteor.userId(), classification: 'Denials'});
    itemList = qlist.map(function (qlist) {
      return qlist.question;
    });

    return Questions.find({_id: {$in: itemList}});
  },    
});