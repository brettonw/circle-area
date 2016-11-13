let displayDiv;
let theSvg;
let theG;
let mouseDown = false;
let mouseLoc;
let theMouseLoc = V(9.5, -0.5);

let redRange;
let blueRange;
let displayAreaSpan;

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
    displayDiv.innerHTML = CircleArea.renderSvg ();
    theSvg = document.getElementById ("theSvg");
    if (mouseLoc == null) {
        mouseLoc = theSvg.createSVGPoint ();
        mouseLoc.x = theMouseLoc.x; mouseLoc.y = theMouseLoc.y;
    }
    theSvg.addEventListener ("mousedown", mousedown, false);
    theSvg.addEventListener ("mouseup", mouseup, false);
    theSvg.addEventListener ("mousemove", mousemove, false);
    theG = document.getElementById ("theG");
};

let onLoad = function () {
    displayDiv = document.getElementById ("displayDiv");
    redRange = document.getElementById ("redRange");
    blueRange = document.getElementById ("blueRange");
    displayAreaSpan = document.getElementById ("displayAreaSpan");
    draw ();
};
