// Logging properties --- //
var traceEnabled = true;

// Window properties --- //
var windowWidth = 1000;
var windowHeight = 800;

// Toolbar properties --- //
var toolbarX = 0;
var toolbarY = 0;
var toolbarWidth = windowWidth;
var toolbarHeight = 30;

// Toolbox properties --- //
var toolboxX = 0;
var toolboxY = toolbarHeight;
var toolboxWidth = 200;
var toolboxHeight = windowHeight - toolbarHeight;
var toolboxHeaderX = 0;
var toolboxHeaderY = toolbarHeight;
var toolboxHeaderWidth = 200;
var toolboxHeaderHeight = 25;

// Drawing canvas properties --- //
var drawingCanvasX = toolboxWidth;
var drawingCanvasY = toolbarHeight;
var drawingCanvasWidth = windowWidth - toolboxWidth;
var drawingCanvasHeight = windowHeight - toolbarHeight;

// Toolbox lifeline properties --- //
var toolboxLifeLineData = [];
var toolboxLifeLineX = 20;
var toolboxLifeLineY = 80;
var toolboxLifeLineWidth = 80;
var toolboxLifeLineHeight = 80;

// Lifeline properties --- //
var lifeLineData = [];
var lifeLineWidth = 120;
var lifeLineHeight = 300;

// Toolbox activation properties --- //
var toolboxActivationData = [];
var toolboxActivationX = 140;
var toolboxActivationY = 80;
var toolboxActivationWidth = 15;
var toolboxActivationHeight = 50;

// Activation properties --- //
var activationData = [];
var activationWidth = 20;
var activationHeight = 70;

// Toolbox frame properties --- //
var toolboxFrameData = [];
var toolboxFrameX = 20;
var toolboxFrameY = 200;
var toolboxFrameWidth = 70;
var toolboxFrameHeight = 50;

// Frame properties --- //
var frameData = [];
var frameWidth = 300;
var frameHeight = 200;

// Create window svg container --- //
var svg = d3.select("body")
    .append("div")
    .attr("id", "d3-sequenced")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg")
    .attr("id", "d3-sequenced-window")
    // responsive SVG needs these 2 attributes and no width and height attr
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + windowWidth + " " + windowHeight)
    .classed("svg-content-responsive", true);

// Create toolbar --- //
var toolbar = svg.append("rect")
    .attr("id", "toolbar")
    .attr("class", "toolbar")
    .attr("width", toolbarWidth)
    .attr("height", toolbarHeight)
    .attr("x", toolbarX)
    .attr("y", toolbarY);

addLabel(svg, 400, 20, "bold h2 white", "Sequence Diagram Editor");

// Create toolbox --- //
var toolbox = svg.append("rect")
    .attr("class", "toolbox")
    .attr("width", toolboxWidth)
    .attr("height", toolboxHeight)
    .attr("x", toolboxX)
    .attr("y", toolboxY);

var toolboxHeader = svg.append("rect")
    .attr("class", "toolbox-header")
    .attr("width", toolboxHeaderWidth)
    .attr("height", toolboxHeaderHeight)
    .attr("x", toolboxHeaderX)
    .attr("y", toolboxHeaderY);

addLabel(svg, 65, 45, "bold h2", "Toolbox");

// Create drawing canvas --- //
var drawingCanvas = svg.append("svg")
    .attr("class", "drawing-canvas")
    .attr("width", drawingCanvasWidth)
    .attr("height", drawingCanvasHeight)
    .attr("x", drawingCanvasX)
    .attr("y", drawingCanvasY);

createElement("lifeline", "Lifeline", "toolbox-lifeline", "lifeline",
  drawLifeLine, toolboxLifeLineData, lifeLineData, toolboxLifeLineX,
  toolboxLifeLineY, toolboxLifeLineWidth,
  toolboxLifeLineHeight, lifeLineWidth, lifeLineHeight);

createElement("activation", "Activation", "toolbox-activation", "activation",
  drawRect, toolboxActivationData, activationData, toolboxActivationX,
  toolboxActivationY, toolboxActivationWidth,
  toolboxActivationHeight, activationWidth, activationHeight);

createElement("frame", "Frame", "toolbox-frame", "frame",
  drawRect, toolboxFrameData, frameData, toolboxFrameX,
  toolboxFrameY, toolboxFrameWidth,
  toolboxFrameHeight, frameWidth, frameHeight);

function createElement(elementName, elementLabel, toolboxClass, elementClass,
  drawElementMethod, toolboxDataArray, dataArray, toolboxElementX, toolboxElementY,
  toolboxElementWidth, toolboxElementHeight, elementWidth, elementHeight) {

  // Element drag event handler --- //
  var dragElementOriginCount = 0;
  var elementDragEventHandler = d3.behavior.drag()
      .origin(function(d) {
          dragElementOriginCount += 1;
          if (dragElementOriginCount == 1) {
              // Due to some reason initial origin needs to be 0,0
              return {
                  x: 0,
                  y: 0
              };
          }
          trace("[" + elementName + "] [origin] " + dToString(d));
          return {
              x: d.x,
              y: d.y
          };
      })
      .on("drag", function(d) {
          trace("[" + elementName + "] [dragging] " + dToString(d));
          moveElement(d3.select(this), dataArray, d);
      })
      .on("dragstart", function(d) {
          trace("[" + elementName + "] [drag started] " + dToString(d));
      })
      .on("dragend", function(d) {
          trace("[" + elementName + "] [drag ended] " + dToString(d));
      });

    // Toolbox element drag event handler --- //
    var elementCount = 0;
    var toolboxElementDragEventHandler = d3.behavior.drag()
        .origin(function(d) {
            trace("[toolbox-" + elementName + "] [origin] " + dToString(d))
            return {
                x: 0,
                y: 0
            };
        })
        .on("drag", function(d) {
            trace("[toolbox-" + elementName + "] [dragging] " + dToString(d));
            moveElement(d3.select("#toolbox-" + elementName + "-movable"),
            toolboxDataArray, d);
        })
        .on("dragstart", function(d) {
            trace("[toolbox-" + elementName + "] [drag started] " + dToString(d));
        })
        .on("dragend", function(d) {
            trace("[toolbox-" + elementName + "] [drag ended] " + dToString(d));

            // Return toolbox element back to its origin
            d3.select("#toolbox-" + elementName + "-movable")
                .attr("transform", function(d) {
                    return "translate(0, 0)";
                });

            // Draw new element
            elementCount += 1;
            var id_ = elementName + "-" + elementCount;
            if (dataArray.indexOf(id_) < 0) {
                trace(elementLabel + " not found in data array[], adding it: " + id_);
                dataArray.push({
                    id: id_,
                    x: d.x,
                    y: d.y
                });
            }
            drawElementMethod(drawingCanvas, id_, elementClass, dataArray,
                d.x, d.y + toolbarHeight, elementWidth, elementHeight,
                elementDragEventHandler, false);
        });

        // Create toolbox item
        var stillElementId = "toolbox-" + elementName + "-still";
        var stillElementEventHandler = d3.behavior.drag();
        toolboxDataArray.push({
          id: stillElementId,
          x: toolboxElementX,
          y: toolboxElementY
        });
        drawElementMethod(svg, stillElementId, toolboxClass, toolboxDataArray,
            toolboxElementX, toolboxElementY, toolboxElementWidth,
            toolboxElementHeight, stillElementEventHandler, true);

        var movableElementId = "toolbox-" + elementName + "-movable";
        toolboxDataArray.push({
            id: movableElementId,
            x: toolboxX,
            y: toolboxY
        });
        drawElementMethod(svg, movableElementId, toolboxClass, toolboxDataArray,
            toolboxElementX, toolboxElementY, toolboxElementWidth,
            toolboxElementHeight, toolboxElementDragEventHandler, true);

        var labelX = toolboxElementX + (toolboxElementWidth / 2) - 20;
        var labelY = toolboxElementY + toolboxElementHeight + 20;
        addLabel(svg, labelX, labelY, "normal", elementLabel);
}

// Draw rectangle
function drawRect(parent, id, class_, data, x, y, width, height, dragEventHandler) {
    parent.append("rect")
        .data(data)
        .attr("id", id)
        .attr("class", class_)
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
        .call(dragEventHandler);
}

// Draw lifeline element
function drawLifeLine(parent, id, class_, data, x, y, width, height, dragEventHandler, isToolboxElement) {

    if(isToolboxElement) {
      rectHeight = height * 30/100;
    } else {
      rectHeight = height * 10/100;
    }
    var lineHeight = height - rectHeight;

    group = parent.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("id", id)
        .attr("class", class_)
        .call(dragEventHandler);

    group.append("rect")
        .attr("class", "lifeline-rect")
        .attr("width", width)
        .attr("height", rectHeight)
        .attr("x", x)
        .attr("y", y);

    if (!isToolboxElement) {
        addLabel(group, x + width / 3, y + 20, "normal", id);
    }

    lineX = x + width / 2;
    lineY1 = y + rectHeight;
    lineY2 = y + rectHeight + lineHeight;

    group.append("line")
        .attr("class", "lifeline-line")
        .attr("x1", lineX)
        .attr("y1", lineY1)
        .attr("x2", lineX)
        .attr("y2", lineY2);

    if (!isToolboxElement) {
        // Add close button icon
        group.append('text')
            .attr("x", lineX + width / 2)
            .attr("y", y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-family', 'font-wso2')
            .style('font-size', '14px')
            .text(function(d) {
                return '\ue630';
            })
            .on("click", function(d) {
                svg.selectAll("#" + id).remove()
            });
    }
}

// Move rectangle to cursor position
function moveElement(rect, data, d) {
    // Update data item
    d.x = d3.event.x;
    d.y = d3.event.y;
    // Set data item values to element coordinates
    rect.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
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
    data = [{
        text: "Lifeline"
    }];
    parent.append("text")
        .attr("class", class_)
        .attr("x", x)
        .attr("y", y)
        .attr("contenteditable", true)
        .data(data)
        .text(function(d) {
            return d.text
        })
        .on("keyup", function(d) {
            d.text = d3.select(this).text();
        });
}

// Prepare string representation of the data element (d)
function dToString(d) {
    return "id: " + d.id + " x: " + d.x + " y: " + d.y;
}

// Print trace logs
function trace(value) {
    if (traceEnabled) {
        console.log(new Date() + " [TRACE] " + value);
    }
}
