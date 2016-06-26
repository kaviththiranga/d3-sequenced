var draggable = d3.behavior.drag()
  .origin(function (d) {
    return (d);
  })
  .on("drag", drg)
  .on("dragstart", function (d) {
    // d3.select(this).attr({
    //   transform: "scale(1.0)"
    // });
    return;
  })
  .on("dragend", function (d) {
    // d3.select(this).attr({
    //   transform: "scale(1.0)"
    // });
    return;
  });

function drg(d) {
  d3.select(this).attr({
    cx: d.x = Math.max(0, d3.event.x),
    cy: d.y = Math.max(0, d3.event.y)
  });
}

var board = d3.select("body").append("svg:svg").attr({
  width: 500,
  height: 500
});

draw([{ x: 100, y: 100}]);
draw([{ x: 200, y: 200}]);
draw([{ x: 300, y: 300}]);
draw([{ x: 400, y: 400}]);

function draw(data) {
  var wrap = board.append("svg:g")
    .data(data);
  var handle = wrap.append("svg:circle")
    .attr({
      cx: function (d) {
        return (d.x);
      },
      cy: function (d) {
        return (d.x);
      },
      r: 30,
      fill: "gray",
      "fill-opacity": 0.3,
      stroke: "red",
      "stroke-opacity": 0.3,
      "stroke-width": 3,
      cursor: "move"
    }).call(draggable);
}