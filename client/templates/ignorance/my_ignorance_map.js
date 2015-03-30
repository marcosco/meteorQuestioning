function drawChart(item) {
  canvas = '#' + item.argument +'_Chart'

  var data = [
      {
          value: item.distribution.uu.absolute,
          color: Meteor.settings.public.ignoranceMap.uu.color,
          highlight: Meteor.settings.public.ignoranceMap.uu.highlight,
          label: Meteor.settings.public.ignoranceMap.uu.label
      },
      {
          value: item.distribution.ku.absolute,
          color: Meteor.settings.public.ignoranceMap.ku.color,
          highlight: Meteor.settings.public.ignoranceMap.ku.highlight,
          label: Meteor.settings.public.ignoranceMap.ku.label
      },
      {
          value: item.distribution.uk.absolute,
          color: Meteor.settings.public.ignoranceMap.uk.color,
          highlight: Meteor.settings.public.ignoranceMap.uk.highlight,
          label: Meteor.settings.public.ignoranceMap.uk.label
      },
      {
          value: item.distribution.er.absolute,
          color: Meteor.settings.public.ignoranceMap.er.color,
          highlight: Meteor.settings.public.ignoranceMap.er.highlight,
          label: Meteor.settings.public.ignoranceMap.er.label
      },
      {
          value: item.distribution.de.absolute,
          color: Meteor.settings.public.ignoranceMap.de.color,
          highlight: Meteor.settings.public.ignoranceMap.de.highlight,
          label: Meteor.settings.public.ignoranceMap.de.label
      },
      {
          value: item.distribution.kk.absolute,
          color: Meteor.settings.public.ignoranceMap.kk.color,
          highlight: Meteor.settings.public.ignoranceMap.kk.highlight,
          label: Meteor.settings.public.ignoranceMap.kk.label
      }          
  ]

  var ctx = $(canvas).get(0).getContext("2d");
  var myNewChart = new Chart(ctx)
  new Chart(ctx).Pie(data,null);

}
Template.myIgnoranceRow.rendered = function () {
  argument = this.data.argument;
    //Get the context of the canvas element we want to select
  Meteor.call('getIgnoranceDistributionByUser', Meteor.userId(), this.data.argument, function (error, result){
    data = {
      argument: result.argument,
      distribution: {
        uu: {
          absolute: result.uu,
        },
        ku: {
          absolute: result.ku,
        },
        er: {
          absolute: result.er,
        },
        de: {
          absolute: result.de,
        },
        uk: {
          absolute: result.uk,
        },
        kk: {
          absolute: result.kk,
        }
      }       
    };

    drawChart(data);
  });
    //drawChart(item);
};

Template.myIgnoranceMap.helpers({
  interestingTags: function () {
    return Arguments.find();
  },
});

Template.myIgnoranceRow.helpers({
  score: function() {
    items = Ignorances.find({user: Meteor.userId(), argument: this.argument});
    var count = 0;
    items.forEach(function (item) {
      count += item.score;
    });
    return count;
  },

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