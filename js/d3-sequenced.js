// Main control flow ---- //
var traceEnabled = true;

var toolBoxLifeLineData = [];
var toolboxActivationData = [];
var toolboxFrameData = [];
var lifeLineData = [];
var activationData = [];

var toolboxLifeLineX = 20;
var toolboxLifeLineY = 80;
var toolboxLifeLineWidth = 70;
var toolboxLifeLineHeight = 25;

var toolboxActivationX = 140;
var toolboxActivationY = 80;
var toolboxActivationWidth = 15;
var toolboxActivationHeight = 50;

var toolboxFrameX = 20;
var toolboxFrameY = 200;
var toolboxFrameWidth = 70;
var toolboxFrameHeight = 50;

var windowWidth = 1200;
var windowHeight = 1000;

var toolbarX = 0;
var toolbarY = 0;
var toolbarWidth = windowWidth;
var toolbarHeight = 30;

var toolboxX = 0;
var toolboxY = toolbarHeight;
var toolboxWidth = 200;
var toolboxHeight = windowHeight - toolbarHeight;

var drawingCanvasX = toolboxWidth;
var drawingCanvasY = toolbarHeight;
var drawingCanvasWidth = windowWidth - toolboxWidth;
var drawingCanvasHeight = windowHeight - toolbarHeight;

// Create window svg container ---- //
var svg = d3.select("body")
     .append("div")
     .attr("id", "d3-sequenced")
     //.classed("svg-container", true) //container class to make it responsive
     .append("svg")
     .attr("id", "d3-sequenced-window")
     .attr("width", windowWidth)
     .attr("height", windowHeight);
     // responsive SVG needs these 2 attributes and no width and height attr
     //.attr("preserveAspectRatio", "xMinYMin meet")
     //.attr("viewBox", "0 0 1000 800");
     //.classed("svg-content-responsive", true);

// Create toolbar ---- //
var toolbar = svg.append("rect")
      .attr("id", "toolbar")
      .attr("class", "toolbar")
      .attr("width", toolbarWidth)
      .attr("height", toolbarHeight)
      .attr("x", toolbarX)
      .attr("y", toolbarY);

     addLabel(svg, 400, 20, "bold h2", "Sequence Diagram Editor");

// Create toolbox ---- //
var toolbox = svg.append("rect")
      .attr("class", "toolbox")
      .attr("width", toolboxWidth)
      .attr("height", toolboxHeight)
      .attr("x", toolboxX)
      .attr("y", toolboxY);
addLabel(svg, 65, 60, "bold h2", "Toolbox");

// Create drawing canvas ---- //
var drawingCanvas = svg.append("svg")
        .attr("class", "drawing-canvas")
        .attr("width", drawingCanvasWidth)
        .attr("height", drawingCanvasHeight)
        .attr("x", drawingCanvasX)
        .attr("y", drawingCanvasY);


// Lifeline drag event handler ---- //
var dragLifeLineOriginCount = 0;
var lifeLineDragEventHandler = d3.behavior.drag()
       .origin(function (d) {
         dragLifeLineOriginCount += 1;
         if(dragLifeLineOriginCount == 1) {
           // Due to some reason initial origin needs to be 0,0
           return { x: 0, y: 0 };
         }
         trace("[lifeline] [origin] " + dToString(d));
         return { x: d.x, y: d.y };
       })
       .on("drag", function(d) {
         trace("[lifeline] [dragging] " + dToString(d));
         moveGroup(d3.select(this), lifeLineData, d);
       })
       .on("dragstart", function(d) {
         trace("[lifeline] [drag started] " + dToString(d));
       })
       .on("dragend", function(d) {
         trace("[lifeline] [drag ended] " + dToString(d));
       });

// Toolbox lifeline drag event handler ---- //
var lifeLineCount = 1;
var toolboxLifeLineDragEventHandler = d3.behavior.drag()
  .origin(function (d) {
    trace("[toolbox-lifeline] [origin] " + dToString(d))
    return { x: 0, y: 0 };
  })
  .on("drag", function(d) {
    trace("[toolbox-lifeline] [dragging] " + dToString(d));
    moveGroup(d3.select("#toolbox-lifeline-movable"), toolBoxLifeLineData, d);
  })
  .on("dragstart", function(d) {
    trace("[toolbox-lifeline] [drag started] " + dToString(d));
  })
  .on("dragend", function(d) {
    trace("[toolbox-lifeline] [drag ended] " + dToString(d));

    // Return the toolbox lifeline back to the origin
    d3.select("#toolbox-lifeline-movable")
      .attr("transform", function(d) { return "translate(0, 0)"; });

    // Draw new lifeline
    var id_ = "lifeline-" + lifeLineCount;
    if(lifeLineData.indexOf(id_) < 0) {
      trace("lifeline not found in data, adding it: " + id_);
      lifeLineData.push({ id: id_, x: d.x, y: d.y });
    }
    drawLifeLine(drawingCanvas, id_, lifeLineData,
      lifeLineDragEventHandler, d.x - toolboxWidth, toolbarHeight,
      100, 30, 200, true, true);
    lifeLineCount += 1;
  });

var activationDragEventHandler = d3.behavior.drag();
    // .origin(function (d) {
    //   dragActivationOriginCount += 1;
    //
    //   if(dragActivationOriginCount == 1) {
    //     // Due to some reason initial origin needs to be 0,0
    //     return { x: 0, y: 0 };
    //   }
    //   trace("[activation] [origin] " + dToString(d));
    //   return { x: d.x, y: d.y };
    // })
    // .on("drag", function(d) {
    //   trace("[activation] [dragging] " + dToString(d));
    //   moveRect(d3.select(this), activationData, d);
    // })
    // .on("dragstart", function(d) {
    //   trace("[activation] [drag started] " + dToString(d));
    // })
    // .on("dragend", function(d) {
    //   trace("[activation] [drag ended] " + dToString(d));
    // });

var activationCount = 1;
var toolboxActivationDragEventHandler = d3.behavior.drag()
    .origin(function (d) {
      trace("[toolbox-activation] [origin] " + dToString(d));
      return { x: 0, y: 0 };
    })
    .on("drag", function(d) {
      trace("[toolbox-activation] [dragging] " + dToString(d));
      moveRect(d3.select("#toolbox-activation-movable"), toolboxActivationData, d);
    })
    .on("dragstart", function(d) {
      trace("[toolbox-activation] [drag started] " + dToString(d));
    })
    .on("dragend", function(d) {
      trace("[toolbox-activation] [drag ended] " + dToString(d));

      // Return the toolbox activation back to the origin
      //d.x = toolboxActivationX;
      //d.y = toolboxActivationY;
      //drawActivation(svg, "toolbox-activation-movable", toolboxActivationData, toolboxActivationX, toolboxActivationY, 15, 50, toolboxActivationDragEventHandler);

      // Draw new lifeline
      // var id_ = "activation-" + activationCount;
      // if(activationData.indexOf(id_) < 0) {
      //   trace("activation not found in data, adding it: " + id_);
      //   activationData.push({ id: id_, x: d.x, y: d.y });
      // }
      //drawActivation(drawingCanvas, id_, activationData, activationDragEventHandler, d.x, d.y, 30, 100);
      //activationCount += 1;
    });

    var toolboxFrameDragEventHandler = d3.behavior.drag()
        .origin(function (d) {
          trace("[toolbox-frame] [origin] " + dToString(d));
          return { x: 0, y: 0 };
        })
        .on("drag", function(d) {
          trace("[toolbox-frame] [dragging] " + dToString(d));
          moveRect(d3.select("#toolbox-frame-movable"), toolboxActivationData, d);
        })
        .on("dragstart", function(d) {
          trace("[toolbox-frame] [drag started] " + dToString(d));
        })
        .on("dragend", function(d) {
          trace("[toolbox-frame] [drag ended] " + dToString(d));
        });

var stillLifeLineEventHandler = d3.behavior.drag();
var stillActivationEventHandler = d3.behavior.drag();
var stillFrameEventHandler = d3.behavior.drag();

drawLifeLineToolboxItem();
drawActivationToolboxItem();
drawFrameToolboxItem();

// Functions ---- //
function drawLifeLineToolboxItem() {
  // Lifeline toolbox item
  toolBoxLifeLineData.push({ id: "toolbox-lifeline-still", x:toolboxLifeLineX,
    y: toolboxLifeLineY});
  drawLifeLine(svg, "toolbox-lifeline-still", toolBoxLifeLineData,
    stillLifeLineEventHandler, toolboxLifeLineX, toolboxLifeLineY, 70, 25, 50);

  toolBoxLifeLineData.push({ id: "toolbox-lifeline-movable", x:toolboxLifeLineX,
    y: toolboxLifeLineY});
  drawLifeLine(svg, "toolbox-lifeline-movable", toolBoxLifeLineData,
    toolboxLifeLineDragEventHandler, toolboxLifeLineX, toolboxLifeLineY, 70, 25, 50);

  addLabel(svg, 35, 170, "normal", "Lifeline");
}

function drawActivationToolboxItem() {
  toolboxActivationData.push({ id: "toolbox-activation-still", x: toolboxActivationX,
    y: toolboxActivationY});
  drawActivation(svg, "toolbox-activation-still", toolboxActivationData,
    toolboxActivationX, toolboxActivationY, toolboxActivationWidth,
    toolboxActivationHeight, stillActivationEventHandler);

  toolboxActivationData.push({ id: "toolbox-activation-movable", x: toolboxActivationX,
    y: toolboxActivationY});
  drawActivation(svg, "toolbox-activation-movable", toolboxActivationData,
    toolboxActivationX, toolboxActivationY, toolboxActivationWidth,
    toolboxActivationHeight, toolboxActivationDragEventHandler);

  addLabel(svg, 120, 170, "normal", "Activation");
}

function drawFrameToolboxItem() {
  toolboxFrameData.push({ id: "toolbox-frame-still", x: toolboxFrameX, y: toolboxFrameY });
    drawFrame(svg, "toolbox-frame-still", toolboxFrameData, toolboxFrameX, toolboxFrameY,
    toolboxFrameWidth, toolboxFrameHeight, stillFrameEventHandler);

  toolboxFrameData.push({ id: "toolbox-frame-movable", x: toolboxFrameX, y: toolboxFrameY });
    drawFrame(svg, "toolbox-frame-movable", toolboxFrameData, toolboxFrameX, toolboxFrameY,
    toolboxFrameWidth, toolboxFrameHeight, toolboxFrameDragEventHandler);

  addLabel(svg, 40, 270, "normal", "Frame");
}

function drawActivation(parent, id, data, x, y, width, height, dragEventHandler) {
  parent.append("rect")
     .data(data)
     .attr("id", id)
     .attr("class", "activation-toolbox-item")
     .attr("x", x)
     .attr("y", y)
     .attr("width", width)
     .attr("height", height)
     .call(dragEventHandler);
}

function drawFrame(parent, id, data, x, y, width, height, dragEventHandler) {
  parent.append("rect")
     .data(data)
     .attr("id", id)
     .attr("class", "toolbox-frame")
     .attr("x", x)
     .attr("y", y)
     .attr("width", width)
     .attr("height", height)
     .call(dragEventHandler);
}

// Draw lifeline elemtnt in toolbox
function drawLifeLine(parent, id, data, dragEventHandler, x, y, width, height, lineHeight, addCloseButton, addIdAsLabel) {

  group = parent.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("id", id)
        .call(dragEventHandler);

  group.append("rect")
       .attr("class", "rect")
       .attr("width", width)
       .attr("height", height)
       .attr("x", x)
       .attr("y", y);

  if(addIdAsLabel) {
    addLabel(group, x + width/4, y + (height/4)*2.5, "normal white", id);
  }

  lineX = x + width/2;
  lineY1 = y + height;
  lineY2 = y + height + lineHeight;

  group.append("line")
       .attr("class", "line")
       .attr("x1", lineX)
       .attr("y1", lineY1)
       .attr("x2", lineX)
       .attr("y2", lineY2);

  if(addCloseButton) {
    // Close icon
    group.append('text')
         .attr("x", lineX + width/2)
         .attr("y", y)
         .attr('text-anchor', 'middle')
         .attr('dominant-baseline', 'central')
         .style('font-family','font-wso2')
         .style('font-size','14px')
         .text(function (d) { return '\ue630'; })
         .on("click", function(d) {
            svg.selectAll("#" + id).remove()
         });
    }
}

function moveGroup(group, data, d) {
  // Update data item
  d.x = d3.event.x;
  d.y = d3.event.y;
  // Set data item values to element coordinates
  group.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function moveRect(rect, data, d) {
  // Update data item
  d.x = d3.event.x;
  d.y = d3.event.y;

  rect.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

// Add a label to an element
function addLabel(parent, x, y, class_, text) {
  parent.append("text")
     .attr("class", class_)
     .attr("x", x)
     .attr("y", y)
     .text(text);
}

// Add a text field to an element
function addTextField(parent, x, y, class_, text) {
  data = [{ text : "Lifeline" }];
  parent.append("text")
     .attr("class", class_)
     .attr("x", x)
     .attr("y", y)
     .attr("contenteditable", true)
     .data(data)
     .text(function(d) { return d.text })
     .on("keyup", function(d) { d.text = d3.select(this).text(); });
}

function dToString(d) {
  return "id: " + d.id + " x: " + d.x + " y: " + d.y;
}

function trace(value) {
  if(traceEnabled) {
    console.log(new Date() + " [TRACE] " + value);
  }
}
