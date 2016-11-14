"use strict;"

let svg;

let initialPrintY = -203;
let halfLine = 9;
let print = function (left, text) {
    svg += '<g class="myG" transform="scale(0.025, -0.025)"><text x="' + left + '" y="' + printY + '"><tspan class="myG">' + text + '</tspan></tspan></text></g>';
    printY += halfLine + halfLine;
};

let printValue = function (name, value) {
    print (470, name + " = " + value.toPrecision (3));
};

// a is a blocker, and b is a light source, what fractional part of b is visible
let computeVisibleFractionWithSvg = function (A, B) {
    printY = initialPrintY;

    print (0, "Click on the blue circle center to move it.");

    // report the basic statistics
    printValue ("Radius A (red)", A.r);
    printValue ("Radius B (blue)", B.r);
    printY += halfLine;

    // compute a few values we'll need repeatedly
    let delta = Vector2.subtract (B.p, A.p);
    let dSq = Vector2.normSq (delta);
    let d = Math.sqrt (dSq);
    printValue ("d", d);
    printY += halfLine;

    // draw the connection line
    svg += '<line x1="' + A.p.x + '" y1="' + A.p.y + '" x2="' + B.p.x + '" y2="' + B.p.y + '"  stroke="green" stroke-width="0.025" />';

    // if the circles are disjoint, the source is completely visible
    if (d >= A.r + B.r) {
        return 1.0;
    }

    // we'll need the areas of the two circles
    let aArea = A.area ();
    printValue ("Area A", aArea);
    let bArea = B.area ();
    printValue ("Area B", bArea);
    printY += halfLine;

    // if one of the circles is completely contained, there is no intersection point
    let rDelta = A.r - B.r;
    if ((rDelta < 0) && (d < -rDelta)) {
        // the blocker is smaller than the source and is contained
        return (bArea - aArea) / bArea;
    } else if (d <= rDelta) {
        // the blocker is larger than the source, or the same size
        return 0.0;
    }

    // compute the lens intersection point, and the height of the chord
    let a = ((A.r * A.r) - (B.r * B.r) + dSq) / (2.0 * d);
    let b = d - a;
    let c = Math.sqrt ((A.r * A.r) - (a * a));
    printValue ("a", a);
    printValue ("b", b);
    printValue ("c", c);
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
    let thetaA = Math.atan2 (c, a);
    printValue ("Theta A", thetaA);
    let wedgeAreaA = aArea * (thetaA / Math.PI);
    printValue ("Wedge A", wedgeAreaA);
    let lensAreaA = wedgeAreaA - (a * c);
    printValue ("a * c", a * c);
    printValue ("Lens A", lensAreaA);
    printY += halfLine;

    // compute the angle of the wedge on B, and the area of the subtended wedge as a fraction of the circle
    let thetaB = Math.atan2 (c, b);
    printValue ("Theta B", thetaB);
    let wedgeAreaB = bArea * (thetaB / Math.PI);
    printValue ("Wedge B", wedgeAreaB);
    let lensAreaB = wedgeAreaB - (b * c);
    printValue ("b * c", b * c);
    printValue ("Lens B", lensAreaB);
    printY += halfLine;

    // return the area of the source minus the area of the intersection
    printValue ("lens A + B", lensAreaA + lensAreaB);
    printValue ("Inclusion", bArea - (lensAreaA + lensAreaB));
    return (bArea - (lensAreaA + lensAreaB)) / bArea;
};


let computeVisibleFraction = function (A, B) {
    // compute a few values we'll need repeatedly
    let delta = Vector2.subtract (B.p, A.p);
    let dSq = Vector2.normSq (delta);
    let d = Math.sqrt (dSq);

    // if the circles are disjoint, the source is completely visible
    if (d >= A.r + B.r) {
        return 1.0;
    }

    // we'll need the areas of the two circles
    let aArea = A.area ();
    let bArea = B.area ();

    // if one of the circles is completely contained, there is no intersection point
    let rDelta = A.r - B.r;
    if ((rDelta < 0) && (d < -rDelta)) {
        // the blocker is smaller than the source and is contained
        return (bArea - aArea) / bArea;
    } else if (d <= rDelta) {
        // the blocker is larger than the source, or the same size
        return 0.0;
    }

    // compute the lens intersection point, and the height of the chord
    let a = ((A.r * A.r) - (B.r * B.r) + dSq) / (2.0 * d);
    let b = d - a;
    let c = Math.sqrt ((A.r * A.r) - (a * a));

    // compute the angle of the wedge on A, and the area of the subtended wedge as a fraction of the circle
    let thetaA = Math.atan2 (c, a);
    let wedgeAreaA = aArea * (thetaA / Math.PI);
    let lensAreaA = wedgeAreaA - (a * c);

    // compute the angle of the wedge on B, and the area of the subtended wedge as a fraction of the circle
    let thetaB = Math.atan2 (c, b);
    let wedgeAreaB = bArea * (thetaB / Math.PI);
    let lensAreaB = wedgeAreaB - (b * c);

    // return the area of the source minus the area of the intersection
    return (bArea - (lensAreaA + lensAreaB)) / bArea;
};


let CircleIntersection = function () {
    let _ = Object.create(null);

    _.renderSvg = function (A, B) {
        // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
        svg = '';

        svg += '<circle title="A" cx="' + A.p.x + '" cy="' + A.p.y + '" r="' + A.r + '" fill="none" stroke="red" stroke-width="0.05"/>';
        svg += '<circle title="B" cx="' + B.p.x + '" cy="' + B.p.y + '" r="' + B.r + '" fill="none" stroke="blue" stroke-width="0.05"/>';

        let visible = computeVisibleFractionWithSvg (A, B);
        displayAreaSpan.innerHTML = "Vis " + visible.toPrecision (3);

        svg += '<circle title="Ac" cx="' + A.p.x + '" cy="' + A.p.y + '" r="' + 0.15 + '" fill="red" stroke="none"/>';
        svg += '<circle title="Bc" cx="' + B.p.x + '" cy="' + B.p.y + '" r="' + 0.15 + '" fill="blue" stroke="none"/>';
        return svg;
    };

    return _;
}();
