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
var activationWidth = 15;
var activationHeight = 50;

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


// Editable text input properties
var textInputWidthOffset = 20;
var textInputHeightOffset = 5;
var lifeLineRectStrokeSize = 1.5;


// Life line title validation properties
var maxTitleLength = 200;
var mixTitleLength = 1;
var validTitleRegex = "";

// Life line rect properties
var minRectWidth = 200;

toolboxArrowActivated = false;

// Create window svg container --- //
var svg = d3.select("body")
    .append("div")
    .attr("id", "d3-sequenced")
    .classed("svg-container", true) //container class to make it responsive
    .append("svg:svg")
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

addLabel(svg, 65, 47, "bold h2", "Toolbox");

// Create drawing canvas --- //
var drawingCanvas = svg.append("svg")
    .attr("class", "drawing-canvas")
    .attr("width", drawingCanvasWidth)
    .attr("height", drawingCanvasHeight)
    .attr("x", drawingCanvasX)
    .attr("y", drawingCanvasY);

// Define marker    
var marker = drawingCanvas.append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 0)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 15)
    .attr("orient", "auto");

// Define marker path
var markerPath = marker.append("svg:path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z");

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
    
drawArrowLine("toolbox-arrow-line", 120, 220, 175, 220);
addLabel(svg, 120, 270, "normal", "Arrow Line")
    .on("click", function () {
    if(toolboxArrowActivated) {
       deactivateArrowLines();
    } else {
       activateArrowLines();
    }
});

function createElement(elementName, elementLabel, toolboxClass, elementClass,
    drawElementMethod, toolboxDataArray, dataArray, toolboxElementX, toolboxElementY,
    toolboxElementWidth, toolboxElementHeight, elementWidth, elementHeight) {

    // Element drag event handler --- //
    var elementDragEventHandler = d3.behavior.drag()
        .origin(function (d) {
            d.originInvocationCount += 1;
            if (d.originInvocationCount == 1) {
                // Due to some reason initial origin needs to be 0,0
                trace("Origin: { x:0, y:0 }")
                return {
                    x: 0,
                    y: 0
                };
            }
            trace("Origin: " + dToString(d));
            return {
                x: d.x,
                y: d.y
            };
        })
        .on("drag", function (d) {
            //trace("Dragging element: " + dToString(d));
            if(toolboxArrowActivated) {
                return;
            }
            moveElement(d3.select(this), dataArray, d);
        })
        .on("dragstart", function (d) {
            trace("Drag started: " + dToString(d));
        })
        .on("dragend", function (d) {
            trace("Drag ended: " + dToString(d));
        });

    // Toolbox element drag event handler --- //
    var elementCount = 0;
    var toolboxElementDragEventHandler = d3.behavior.drag()
        .origin(function (d) {
            trace("Origin: " + dToString(d))
            return {
                x: toolboxElementX,
                y: toolboxElementY
            };
        })
        .on("drag", function (d) {
            if(toolboxArrowActivated) {
                return;
            }
            trace("Dragging element: " + dToString(d));
            var element = d3.select("#toolbox-" + elementName + "-movable");
            moveToolboxElement(element, d, toolboxElementX, toolboxElementY);
        })
        .on("dragstart", function (d) {
            trace("Drag started: " + dToString(d));
        })
        .on("dragend", function (d) {
            trace("Drag ended: " + dToString(d));

            // Return toolbox element back to its origin
            d3.select("#toolbox-" + elementName + "-movable")
                .attr("transform", function (d) {
                    return "translate(0, 0)";
                });

            // Calculate relative coordinates
            d.x = d.x - (toolboxWidth - toolboxElementX);
            d.y = d.y + (toolboxElementY - toolbarHeight);

            elementCount += 1;
            var id_ = elementName + "-" + elementCount;
            if (dataArray.indexOf(id_) < 0) {
                trace(elementLabel + " not found in data array[], adding it: " + dToString(d));
                dataArray.push({
                    id: id_,
                    x: d.x,
                    y: d.y,
                    originInvocationCount: 0
                });
            }

            // Draw new element
            drawElementMethod(drawingCanvas, id_, elementClass, dataArray,
                d.x, d.y, elementWidth, elementHeight,
                elementDragEventHandler, false);
        });

    // Create toolbox item
    var stillElementId = "toolbox-" + elementName + "-still";
    var stillElementEventHandler = d3.behavior.drag();
    toolboxDataArray.push({
        id: stillElementId,
        x: toolboxElementX,
        y: toolboxElementY,
        originInvocationCount: 0
    });
    drawElementMethod(svg, stillElementId, toolboxClass, toolboxDataArray,
        toolboxElementX, toolboxElementY, toolboxElementWidth,
        toolboxElementHeight, stillElementEventHandler, true);

    var movableElementId = "toolbox-" + elementName + "-movable";
    toolboxDataArray.push({
        id: movableElementId,
        x: toolboxX,
        y: toolboxY,
        originInvocationCount: 0
    });
    drawElementMethod(svg, movableElementId, toolboxClass, toolboxDataArray,
        toolboxElementX, toolboxElementY, toolboxElementWidth,
        toolboxElementHeight, toolboxElementDragEventHandler, true);

    var labelX = toolboxElementX + (toolboxElementWidth / 2) - 20;
    var labelY = toolboxElementY + toolboxElementHeight + 20;
    addLabel(svg, labelX, labelY, "normal", elementLabel);
}

function activateArrowLines() {
    svg.on("mousedown", mousedown);
    svg.on("mouseup", mouseup);
    toolboxArrowActivated = true;
    trace("Arrow lines activated");
}

function deactivateArrowLines() {
    svg.on("mousedown", null);
    svg.on("mouseup", null);
    toolboxArrowActivated = false;
    trace("Arrow lines de-activated");
}

var line;
var arrowLineCount = 1;
function mousedown() {
    console.log("mousedown trigerred");
    
    var m = d3.mouse(this);
    var x = Math.max(drawingCanvasX + 5, m[0]);
    var y = Math.max(drawingCanvasY + 5, m[1]);
   
    id = "arrow-line-" + arrowLineCount;
    arrowLineCount += 1;
    
    drawArrowLine(id, x, y, x, y);
    svg.on("mousemove", mousemove);
}

function mousemove() {
    var x1 = line.attr("x1");
    var y1 = line.attr("y1");
    
    var m = d3.mouse(this);
    var x2 = Math.max(drawingCanvasX + 5, m[0]);
    var y2 = Math.max(drawingCanvasY + 5, m[1]);
    
    line.attr("x2", x2)
        .attr("y2", y2);
    trace("drawing arrow line: [x1] " + x1 + " [y1] " + y1 + " [x2] " + x2 + " [y2] " + y2);
}

function mouseup() {
    console.log("mouseup trigerred");    
    svg.on("mousemove", null);
    deactivateArrowLines();
    
    var x1 = parseInt(line.attr("x1"));
    var y = parseInt(line.attr("y1"));
    var x2 = parseInt(line.attr("x2"));
    
    // Make the line horizontal
    line.attr("y2", y);
  
    var id = line.attr("id");
    var labelX = (x2 > x1) ? (x1 + ((x2 - x1) * 1.5/4)) : (x2 + ((x1 - x2) * 1.5/4)); 
    var labelY = y - 10;
    
    addLabel(svg, labelX, labelY, "normal", id + "()");
    trace("arrow line drawn from (" + x1 + "," + y + ") to (" + x2 + "," + y + ")")
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

    trace("Rectangle drawn: [id]: " + id + " [x]: " + y + " [y]: " + y)
}

// Draw lifeline element
function drawLifeLine(parent, id, class_, data, x, y, width, height,
    dragEventHandler, isToolboxElement) {

    trace("Lifeline to be drawn: [id]: " + id + " [x]: " + x + " [y]: " + y);

    if (isToolboxElement) {
        rectHeight = height * 30 / 100;
    } else {
        rectHeight = height * 10 / 100;
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
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", rectHeight);

    if (!isToolboxElement) {
        addLabel(group,
                x + (width / 2 + lifeLineRectStrokeSize),
                y + (rectHeight / 2 + lifeLineRectStrokeSize),
                "normal centered-text", id)
            .call(makeTextEditable);
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
            .text(function (d) {
                return '\ue630';
            })
            .on("click", function (d) {
                svg.selectAll("#" + id).remove()
            });
    }
    trace("Lifeline drawn: [id]: " + id + " [x]: " + x + " [y]: " + y);
}

function drawArrowLine(id, x1, y1, x2, y2, clickEventHandler) {
    line = svg.append("line")
        .attr("id", id)
        .attr("class", "arrow-line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("marker-end", "url(#triangle)")
        .on("click", clickEventHandler);
}

// Move rectangle to cursor position
function moveToolboxElement(rect, d, toolboxElementX, toolboxElementY) {
    // Update data item
    d.x = d3.event.x - toolboxElementX;
    d.y = d3.event.y - toolboxElementY;
    // Set data item values to element coordinates
    rect.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function moveElement(rect, data, d) {
    // Update data item, restrict the movement to drawing canvas
    trace("Moving element: " + dToString(d) + " d3.event.x: " + d3.event.x + " " + d3.event.y);

    d.x = d3.event.x; //Math.max(0, Math.max(toolboxWidth, d3.event.x));
    d.y = d3.event.y; //Math.max(0, Math.max(0, d3.event.y));
    // Set data item values to element coordinates
    rect.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function makeTextEditable(textElement) {
    textElement.on("mouseover", function () {
        d3.select(this).classed("editable-text", true);
    }).on("mouseout", function () {
        d3.select(this).classed("editable-text", false);
    }).on("dblclick", function (d) {

        var parent = this.parentNode;
        var bBox = this.getBBox();
        var element = d3.select(this);
        var parentElement = d3.select(parent);
        var form = parentElement.append("foreignObject");

        var width = bBox.width + textInputWidthOffset;
        var height = bBox.height + textInputHeightOffset;
        var x = bBox.x - width/2;
        var y = bBox.y;
        var size = element.text().length + 5;

        var input = form
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .append("xhtml:form")
            .append("input")
            .attr("size", size)
            .attr("value", function () {
                this.focus();
                this.setSelectionRange(0, this.value.length)
                return d.title;
            })
            .on("blur", function () {
                updateLifeLineTitle(element, parentElement, input, d);
            })
            .on("keypress", function () {
                var event = d3.event;
                if (event.keyCode == 13) {
                    if (event.stopPropagation)
                        event.stopPropagation();
                    event.preventDefault();
                    updateLifeLineTitle(element, parentElement, input, d);
                }
            });
    });
}

function updateLifeLineTitle(label, group, textInput, data){
    var newText = textInput.node().value;
    data.title = newText;
    label.text(function (d) {
        return d.title;
    });
    newBBox = label.node().getBBox();
    currentWidth =  group.select("rect").attr("width");
    newWidth = newBBox.width + 20;
    if(newWidth < lifeLineWidth){
        newWidth = lifeLineWidth;
    }
//    group.select("rect")
//        .attr("width", newWidth)
//        .attr("x", newBBox.x - 10)
//        .attr("y", newBBox.y - 7.5);
    group.select("foreignObject").remove();
}

// Add a label to an element
function addLabel(parent, x, y, class_, text) {
    var textElement = parent.append("text")
        .attr("class", class_)
        .attr("x", x)
        .attr("y", y);

    // set title in datum it self for
    // data binded nodes
    if (parent.datum() != undefined) {
        parent.datum().title = text;
        textElement.text(function (d) {
            return d.title;
        });
    } else {
        textElement.text(text);
    }
    return textElement;
}

// Add a text field to an element
// function addTextField(parent, x, y, class_, text) {
//     data = [{
//         text: "Lifeline"
//     }];
//     parent.append("text")
//         .attr("class", class_)
//         .attr("x", x)
//         .attr("y", y)
//         .attr("contenteditable", true)
//         .data(data)
//         .text(function (d) {
//             return d.text
//         })
//         .on("keyup", function (d) {
//             d.text = d3.select(this).text();
//         });
// }

// Prepare string representation of the data element (d)
function dToString(d) {
    return "[id] " + d.id + " [title] " + d.title + " [x] " + d.x + " [y] " + d.y;
}

// Print trace logs
function trace(value) {
    if (traceEnabled) {
        console.log(new Date() + " [TRACE] " + value);
    }
}
