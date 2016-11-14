"use strict;"

// parameters used by the layout
let displayWidth = 600;
let displayHeight = 400;

let displayDiv;
let plotDiv;
let theSvg;
let theG;
let mouseDown = false;
let mouseLoc;
let theMouseLoc = V(9.5, -0.5);

let redRange;
let blueRange;
let displayAreaSpan;

let smoothStepCheckbox;
let linearStepCheckbox;
let myStepCheckbox;
let analyticCheckbox;


let computeMousePos = function (event) {
    mouseLoc.x = event.clientX;
    mouseLoc.y = event.clientY;
    let matrix = theG.getScreenCTM ().inverse ();
    return mouseLoc.matrixTransform (matrix);
};

let mousedown = function (event) {
    let mouse = computeMousePos(event);
    if (Vector2.subtract (mouse, theMouseLoc).norm () < 0.2) {
        mouseDown = true;
        mousemove (event);
    }
};

let mouseup = function (event) {
    mouseDown = false;
};

let mousemove = function (event) {
    if (mouseDown) {
        theMouseLoc = computeMousePos (event);
        draw ();
    }
};

let draw = function () {
    let A = Circle.new (V (3.0, 0.0), redRange.value * 5.0 / 100.0);
    let B = Circle.new (V (theMouseLoc.x, theMouseLoc.y), blueRange.value * 5.0 / 100.0);
    theG.innerHTML = CircleIntersection.renderSvg (A, B);
};

let clamp = function (x, min, max) {
    return Math.min (Math.max (x, min), max);
};

let linearStep = function (edge0, edge1, x) {
    // Scale, and clamp x to 0..1 range
    return clamp ((x - edge0) / (edge1 - edge0), 0.0, 1.0);
};

let smoothStep = function (edge0, edge1, x) {
    // Scale, bias and saturate x to 0..1 range
    x = linearStep (edge0, edge1, x);
    // Evaluate polynomial
    return x * x * (3.0 - (2.0 * x));
};

// custom fit function combining linear approximation with hermite interpolation after the cusp
let inflectionPt = 0.7886751345948128; // dxdy = 1
let inflectionValue = inflectionPt * inflectionPt * (3.0 - (2.0 * inflectionPt));
let myStep = function (edge0, edge1, x) {
    x = linearStep (edge0, edge1, x);
    return (x < inflectionPt) ? (inflectionValue * x / inflectionPt) : (x * x * (3.0 - (2.0 * x)));
};

let plot = function () {
    let rA = redRange.value * 5.0 / 100.0;
    let rB = blueRange.value * 5.0 / 100.0;
    let A = Circle.new (V (0.0, 0.0), rA);

    let plotDataArray = [];
    let plotTitleArray = [];

    let plotData = [];
    let smoothStepPlotData = [];
    let linearStepPlotData = [];
    let myStepPlotData = [];

    let bArea = Math.PI * rB * rB;
    let baseline = Math.max (0.0, (bArea - A.area()) / bArea);
    let edge0 = Math.abs (rA - rB);
    let edge1 = rA + rB;

    let plotMax = rA + rB;
    let plotSteps = 40;
    let plotStep = plotMax / plotSteps;
    for (let i = 0; i <= (plotSteps + 1); ++i) {
        let x = i * plotStep;

        smoothStepPlotData.push ({ x: x, y: baseline + (smoothStep(edge0, edge1, x) * (1.0 - baseline)) });
        linearStepPlotData.push ({ x: x, y: baseline + (linearStep(edge0, edge1, x) * (1.0 - baseline)) });
        myStepPlotData.push ({ x: x, y: baseline + (myStep(edge0, edge1, x) * (1.0 - baseline)) });

        let B = Circle.new (V (x, 0.0), rB);
        plotData.push ({ x: x, y: computeVisibleFraction (A, B) });
    }

    if (smoothStepCheckbox.checked) {
        plotDataArray.push (smoothStepPlotData);
        plotTitleArray.push ("Smooth Step");
    }
    if (linearStepCheckbox.checked) {
        plotDataArray.push (linearStepPlotData);
        plotTitleArray.push ("Linear Step");
    }
    if (myStepCheckbox.checked) {
        plotDataArray.push (myStepPlotData);
        plotTitleArray.push ("My Step");
    }
    if (analyticCheckbox.checked) {
        plotDataArray.push (plotData);
        plotTitleArray.push ("Analytic");
    }

    //plotDiv.innerHTML = PlotSvg.multipleLine ("Visibility of Blue by Separation", "d", "Vis (d)", [myStepPlotData], ["My Step"]);
    //plotDiv.innerHTML = PlotSvg.multipleLine ("Visibility of Blue by Separation", "d", "Vis (d)", [myStepPlotData, plotData], ["My Step", "Analytic"]);
    plotDiv.innerHTML = PlotSvg.multipleLine ("Visibility of Blue by Separation", "d", "Vis (d)", plotDataArray, plotTitleArray);
    //plotDiv.innerHTML = PlotSvg.wrap(plotSvg, 450, "display", "centered");
};

let baseSvg = function () {
    // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
    svg = '<div class="svg-div">';
    svg += '<svg id="theSvg" class="svg-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" ';

    // compute the viewbox from the desired size with a bit of buffer
    let buffer = 0.1;
    let l, t, w, h;
    if (displayWidth > displayHeight) {
        let ratio = displayWidth / displayHeight;
        t = -buffer * displayHeight;
        l = t * ratio;
        h = displayHeight * (1.0 + (buffer * 2.0));
        w = h * ratio;
    } else {
        let ratio = displayHeight / displayWidth;
        l = -buffer * displayWidth;
        t = l * ratio;
        w = displayWidth * (1.0 + (buffer * 2.0));
        h = w * ratio;
    }
    svg += 'viewBox="' + l + ', ' + t + ', ' + w + ', ' + h + '" ';
    svg += 'preserveAspectRatio="xMidYMid meet"';
    svg += '>';

    svg += '<g transform="translate(0, ' + (displayHeight / 2.0) + ')">';
    svg += '<g transform="scale(' + (displayHeight / 10.0) + ')">';
    svg += '<g transform="scale(1, -1)">';
    svg += '<g>';

    // a grid
    for (let i = -5; i <= 5; ++i) {
        if (i != 0) {
            svg += '<line x1="0" y1="' + i + '" x2="15" y2="' + i + '" stroke="gray" stroke-width="0.01" />';
        }
    }
    for (let i = 0; i <= 15; ++i) {
        if (i != 0) {
            svg += '<line x1="' + i + '" y1="-5" x2="' + i + '" y2="5" stroke="gray" stroke-width="0.01" />';
        }
    }
    svg += '<line x1="0" y1="0" x2="15" y2="0" stroke="gray" stroke-width="0.05" />';
    svg += '<line x1="0" y1="-5" x2="0" y2="5" stroke="gray" stroke-width="0.05" />';

    // this is where the actual dynamic content goes...
    svg += '<g id="theG" class="myG">';

    // close the SVG group
    svg += '</g>';
    svg += '</g>';
    svg += '</g>';
    svg += '</g>';
    svg += '</g>';

    // close the plot
    svg += "</div><br>";
    return svg;
};

let onLoad = function () {
    displayDiv = document.getElementById ("displayDiv");
    displayDiv.innerHTML = baseSvg ();
    theSvg = document.getElementById ("theSvg");
    theSvg.addEventListener ("mousedown", mousedown, false);
    theSvg.addEventListener ("mouseup", mouseup, false);
    theSvg.addEventListener ("mousemove", mousemove, false);
    mouseLoc = theSvg.createSVGPoint ();
    mouseLoc.x = 9.5;
    mouseLoc.y = -0.5;
    theG = document.getElementById ("theG");
    plotDiv = document.getElementById ("plotDiv");

    redRange = document.getElementById ("redRange");
    blueRange = document.getElementById ("blueRange");
    displayAreaSpan = document.getElementById ("displayAreaSpan");

    smoothStepCheckbox = document.getElementById ("smoothStepCheckbox");
    linearStepCheckbox = document.getElementById ("linearStepCheckbox");
    myStepCheckbox = document.getElementById ("myStepCheckbox");
    analyticCheckbox = document.getElementById ("analyticCheckbox");

    draw ();
    plot ();
};

