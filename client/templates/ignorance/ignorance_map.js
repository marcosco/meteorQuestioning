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
          color:"#F7464A",
          highlight: "#FF5A5E",
          label: "Unknown Unknowns"
      },
      {
          value: item.distribution.ku.absolute,
          color: "#46BFBD",
          highlight: "#5AD3D1",
          label: "Known Unknowns"
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
Template.ignoranceRow.rendered = function () {
    //Get the context of the canvas element we want to select
  Arguments.find().forEach(function (item){
    drawChart(item);
  })
};

Template.ignoranceRow.helpers({
  chart: function() {
    canvasId = this.argument + "_Chart";
    return canvasId;
  }
})
