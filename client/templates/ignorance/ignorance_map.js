Template.ignoranceMap.helpers({
  interestingTags: function () {
    return Arguments.find();
  }
});

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
Template.ignoranceRow.rendered = function () {
    //Get the context of the canvas element we want to select
  item = Arguments.findOne({argument: this.data.argument})
  drawChart(item);
};

Template.ignoranceRow.helpers({
  chart: function() {
    canvasId = this.argument + "_Chart";
    return canvasId;
  }
})
