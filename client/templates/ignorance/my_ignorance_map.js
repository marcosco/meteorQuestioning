function setGoal(data) {
  goal =    ((data.score / 100) * data.uu.percentage) * Meteor.settings.public.goal.modifiers.uu
          + ((data.score / 100) * data.ku.percentage) * Meteor.settings.public.goal.modifiers.ku
          + ((data.score / 100) * data.uk.percentage) * Meteor.settings.public.goal.modifiers.uk
          + ((data.score / 100) * data.de.percentage) * Meteor.settings.public.goal.modifiers.de
          + ((data.score / 100) * data.er.percentage) * Meteor.settings.public.goal.modifiers.er
          + ((data.score / 100) * data.kk.percentage) * Meteor.settings.public.goal.modifiers.kk

  goalAbs = Math.round(goal)

  goalPercentage = Math.round(goalAbs * 100 / Meteor.settings.public.goal.score);

  element = '#' + data.argument + '_Goal';

  pbarDanger = '#progress-danger-' + data.argument;
  pbarWarning = '#progress-warning-' + data.argument;
  pbarOk = '#progress-ok-' + data.argument;

  $(element).html('').append( goalPercentage + '%');

  switch(true) {
    case goalPercentage <= 10:
      bar = goalPercentage;
      $(pbarDanger).attr("aria-valuenow", bar).css('width', bar + '%');
      $(pbarWarning).attr("aria-valuenow", "0").css('width', '0%');
      $(pbarOk).attr("aria-valuenow", "0").css('width', '0%');
      break;
    case goalPercentage > 10 && goalPercentage <= 30:
      bar = goalPercentage - 10;
      $(pbarDanger).attr("aria-valuenow", "10").css('width', '10%');;
      $(pbarWarning).attr("aria-valuenow", bar).css('width', bar + '%');
      $(pbarOk).attr("aria-valuenow", "0").css('width', '0%');;
      break;
    case goalPercentage > 30:
      bar = goalPercentage - 30;
      $(pbarDanger).attr("aria-valuenow", "10").css('width', '10%');;
      $(pbarWarning).attr("aria-valuenow", "20").css('width', '20%');;
      $(pbarOk).attr("aria-valuenow", bar).css('width', bar + '%');
      break;
  }

}
function drawDonuts(item) {
  charts = ['uu','ku','uk','er','de','kk'];
  charts.forEach(function(ignorance){
  canvas = '#' + ignorance + '-' + item.argument +'_Chart';

  var data = [
      {
          value: item.distribution[ignorance].percentage,
          color: Meteor.settings.public.ignoranceMap[ignorance].color,
          highlight: Meteor.settings.public.ignoranceMap[ignorance].highlight,
          label: Meteor.settings.public.ignoranceMap[ignorance].label
      },
      {
          value: 100 - item.distribution[ignorance].percentage,
          color: '#ffffff',
          highlight: '#ffffff',
          label: ''
      },      
  ]

  var ctx = $(canvas).get(0).getContext("2d");
  var myNewChart = new Chart(ctx)
  new Chart(ctx).Doughnut(data,{
    segmentShowStroke : true,
   //String - The colour of each segment stroke
    segmentStrokeColor : "#000",

    //Number - The width of each segment stroke
    segmentStrokeWidth : 1,    
    animateScale: true
  });
  })
}

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
          absolute: result.uu.absolute,
          percentage: result.uu.percentage,
        },
        ku: {
          absolute: result.ku.absolute,
          percentage: result.ku.percentage,
        },
        er: {
          absolute: result.er.absolute,
          percentage: result.er.percentage,
        },
        de: {
          absolute: result.de.absolute,
          percentage: result.de.percentage,
        },
        uk: {
          absolute: result.uk.absolute,
          percentage: result.uk.percentage,
        },
        kk: {
          absolute: result.kk.absolute,
          percentage: result.kk.percentage,
        }
      }       
    };

    drawChart(data);
    setGoal(result);
    drawDonuts(data);
  });
    //drawChart(item);
};

Template.myIgnoranceMap.helpers({
  interestingTags: function () {
    return Arguments.find();
  }
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
  ignoranceClasses: function () {
    return $.map(Meteor.settings.public.ignoranceMap, function(value){return value});
  }  
});
