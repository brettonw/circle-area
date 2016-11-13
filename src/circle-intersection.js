"use strict;"

let svg;

let initialPrintY = -185;
let halfLine = 9;
let print = function (name, value) {
    svg += '<g transform="scale(0.025, -0.025)"><text x="470" y="' + printY + '"><tspan>' + name + ' = ' + value.toPrecision (3) + '</tspan></tspan></text></g>';
    printY += halfLine + halfLine;
};

// a is a blocker, and b is a light source, what fractional part of b is visible
let computeVisibleFraction = function (A, B) {
    printY = initialPrintY;

    // report the basic statistics
    print ("A.r (red)", A.r);
    print ("B.r (blue)", B.r);
    printY += halfLine;

    // compute a few values we'll need repeatedly
    let delta = Vector2.subtract (B.p, A.p);
    let dSq = Vector2.normSq (delta);
    let d = Math.sqrt(dSq);
    print ("d", d);
    printY += halfLine;

    // draw the connection line
    svg += '<line x1="' + A.p.x + '" y1="' + A.p.y + '" x2="' + B.p.x + '" y2="' + B.p.y + '"  stroke="green" stroke-width="0.025" />';

    // if the circles are disjoint, the source is completely visible
    if (d >= A.r + B.r) {
        return 1.0;
    }

    // we'll need the areas of the two circles
    let aArea = A.area ();
    print ("A.area", aArea);
    let bArea = B.area ();
    print ("B.area", bArea);
    printY += halfLine;

    // if one of the circles is completely contained, there is no intersection point
    let rDelta = A.r - B.r;
    if ((rDelta < 0) && (d < -rDelta)) {
        // the blocker is smaller than the source and is contained
        return (bArea - aArea) / bArea;
    } else if (d < rDelta) {
        // the blocker is larger than the source
        return 0.0;
    }

    // compute the lens intersection point, and the height of the chord
    let a = ((A.r * A.r) - (B.r * B.r) + dSq) / (2.0 * d);
    let b = d - a;
    let c = Math.sqrt ((A.r * A.r) - (a * a));
    print ("a", a);
    print ("b", b);
    print ("c", c);
    printY += halfLine;

    // compute the location of the intersection point
    let perp = delta.scale (1.0 / d).perp ();
    let i = A.p.add (delta.scale (a / d));
    svg += '<circle title="i" cx="' + i.x + '" cy="' + i.y + '" r="' + 0.15 + '" fill="green" stroke="none"/>';
    let j1 = i.add (perp.scale (c));
    let j2 = i.add (perp.scale (-c));
    svg += '<circle title="j1" cx="' + j1.x + '" cy="' + j1.y + '" r="' + 0.15 + '" fill="green" stroke="none"/>';
    svg += '<circle title="j2" cx="' + j2.x + '" cy="' + j2.y + '" r="' + 0.15 + '" fill="green" stroke="none"/>';
    svg += '<line x1="' + j1.x + '" y1="' + j1.y + '" x2="' + j2.x + '" y2="' + j2.y + '"  stroke="green" stroke-width="0.025" />';

    // compute the angle of the wedge on A, and the area of the subtended wedge as a fraction of the circle
    let thetaA = Math.atan2(c, a);
    print ("thetaA", thetaA);
    let wedgeAreaA = aArea * (thetaA / Math.PI);
    print ("wedge A", wedgeAreaA);
    let lensAreaA = wedgeAreaA - (a * c);
    print ("a * c", a * c);
    print ("lens A", lensAreaA);
    printY += halfLine;

    // compute the angle of the wedge on B, and the area of the subtended wedge as a fraction of the circle
    let thetaB = Math.atan2 (c, b);
    print ("thetaB", thetaB);
    let wedgeAreaB = bArea * (thetaB / Math.PI);
    print ("wedge B", wedgeAreaB);
    let lensAreaB = wedgeAreaB - (b * c);
    print ("b * c", b * c);
    print ("lens B", lensAreaB);
    printY += halfLine;

    // return the area of the source minus the area of the intersection
    print ("lens A + B", lensAreaA + lensAreaB);
    print ("total inclusion", bArea - (lensAreaA + lensAreaB));
    return (bArea - (lensAreaA + lensAreaB)) / bArea;
};


let CircleArea = function () {
    let _ = Object.create(null);

    // parameters used by the layout
    let displayWidth = 600;
    let displayHeight = 400;

    // render with an adapter (an object that links externally defined values
    // to the display characteristics of the node)
    _.renderSvg = function () {
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

        svg += '<g transform="translate(0, ' + (displayHeight / 2.0) +')">';
        svg += '<g transform="scale(' + (displayHeight / 10.0) + ')">';
        svg += '<g transform="scale(1, -1)">';
        svg += '<g id="theG">';

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

        let rA = redRange.value * 5.0 / 100.0;
        let A = Circle.new (V (2.75, 0.0), rA);
        let B = Circle.new (V (theMouseLoc.x, theMouseLoc.y), blueRange.value * 5.0 / 100.0);

        svg += '<circle title="A" cx="' + A.p.x + '" cy="' + A.p.y + '" r="' + A.r + '" fill="none" stroke="red" stroke-width="0.05"/>';
        svg += '<circle title="B" cx="' + B.p.x + '" cy="' + B.p.y + '" r="' + B.r + '" fill="none" stroke="blue" stroke-width="0.05"/>';

        let visible = computeVisibleFraction (A, B);
        displayAreaSpan.innerHTML = "Vis " + visible.toPrecision (3);

        svg += '<circle title="Ac" cx="' + A.p.x + '" cy="' + A.p.y + '" r="' + 0.15 + '" fill="red" stroke="none"/>';
        svg += '<circle title="Bc" cx="' + B.p.x + '" cy="' + B.p.y + '" r="' + 0.15 + '" fill="blue" stroke="none"/>';

        // close the SVG group
        svg += '</g>';
        svg += '</g>';
        svg += '</g>';
        svg += '</g>';

        // close the plot
        svg += "</div><br>";
        return svg;
    };

    return _;
}();
