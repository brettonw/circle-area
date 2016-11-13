"use strict;"

// assuming a is the smaller circle, find the squared length from the center of b to the point where
// an intersection transitions from a lens to a crescent
let computeLensInflectionPoint = function (a, b) {
    let xSq = (b.r * b.r) - (a.r * a.r);
    return xSq;
};

// assuming a is the smaller circle, find the point along the delta vector that is the division
// between the two arcs in a lens
let computeLensIntersectionPoint = function (A, B, dSq) {
    let d = Math.sqrt (dSq);
    return ((A.r * A.r) - (B.r * B.r) + dSq) / (2.0 * Math.sqrt (dSq));
};

let computeLensArea = function (a, ) {

};

// a is a blocker, and b is a light source, what fractional part of b is visible
let computeVisibleFraction = function (A, B) {
    // the algorithm here identifies several cases:
    // 1) the two circles are entirely disjoint (including touching at a single point)
    // 2) lens, the shape of the intersection resembles a lens
    // 3) crescent, the shape of the intersection resembles a crescent

    // compute a few values we'll need repeatedly
    let delta = Vector2.subtract (A.p, B.p);
    let dSq = Vector2.normSq (delta);
    let d = Math.sqrt(dSq);

    // if the circles are disjoint, the source is completely visible
    if (d >= A.r + B.r) {
        return 1.0;
    }

    // if one of the circles is completely contained, there is no intersection point
    let rDelta = A.r - B.r;
    if ((rDelta < 0) && (d < -rDelta)) {
        // the blocker is smaller than the source and is contained
        let bArea = B.area();
        return (bArea - A.area()) / bArea;
    } else if (d < rDelta) {
        // the blocker is larger than the source
        return 0.0;
    }

    // compute the lens intersection point
    let a = ((A.r * A.r) - (B.r * B.r) + dSq) / (2.0 * d);
    let c =
};


let CircleArea = function () {
    let _ = Object.create(null);

    let a = Circle.new (V (0, 0), 0.75);
    let b = Circle.new (V (2, 0), 1.0);

    // function to compute the visible area of b
    let computeVisibleAmount = function (a, b) {
        // the question here is ... given that b is a light source and a is a blocker, how much of b
        // is visible?
        if (a.r > b.r ) {
        }

        // compute the distance between the two circle centers
        let delta = Vector2.subtract (a.p, b.p).norm ();

        // if the two circles are completely separate
        if (delta > (a.r + b.r)) {
            return 1.0;
        }

        // if the smaller circle is completely contained
        if (delta <= (b.r - a.r)) {
            let bArea = b.area ();
            return (bArea - a.area ()) / bArea ();
        }

        // lens (find the inflection point)
        if (delta < Math.sqrt((a.r * a.r) + (b.r * b.r))) {

        }

        // crescent, this is everything else....
    };

    // the rendering radius of nodes
    let nodeRadius = 4.5;
    _.setNodeRadius = function (r) {
        nodeRadius = r;
    };

    // parameters used by the layout
    let displayWidth = 600;
    let displayHeight = 400;

    // parameters used to make pretty curves in the edges
    let edgeTension = 0.4;

    // "padding" values on the row lines
    let rowPadding = 0.5;

    // label drawing assistance
    let drawLabels = true;
    let labelLength = 12;
    let TextPlacement = {
        "LEFT": -1,
        "RIGHT": 1
    };
    let labelStyle = {
        "LEFT": ' style="text-anchor:end;" ',
        "RIGHT": ' style="text-anchor:start;" '
    };
    let textPostSpacing = 0.33;

    // utility function to make points from pairs
    let point = function (x, y) { return { "x": x, "y": y }; };

    // layout base classes
    let linearLayout = function (include) {
        let ll = Object.create(include);

        ll.setup = function (treeWidth, treeDepth) {
            this.treeWidth = treeWidth;
            Object.getPrototypeOf(this).setup(treeWidth, treeDepth);
        };

        ll.drawRow = function (i) {
            let a = this.xy(point(-rowPadding, i));
            let b = this.xy(point(this.treeWidth + rowPadding, i));
            return '<line class="tree-svg-row" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" />';
        };

        return ll;
    };

    let radialLayout = function (include) {
        let rl = Object.create(include);

        rl.setup = function (treeWidth, treeDepth) {
            this.treeWidth = treeWidth;
            Object.getPrototypeOf(this).setup(treeWidth, treeDepth);
        };

        rl.drawRow = function (i) {
            let prototype = Object.getPrototypeOf(this);
            if (prototype.hasOwnProperty("drawRow")) {
                return prototype.drawRow(i);
            } else {
                let left = this.xy(point(-rowPadding, i));
                let right = this.xy(point(this.treeWidth + rowPadding, i));
                let r = i * this.yScale;
                return '<path d="M' + left.x + ',' + left.y + ' A' + r + ',' + r + ' 0 0,0 ' + right.x + ',' + right.y + '" class="tree-svg-row" />';
            }
        };

        rl.xy = function (xy) {
            let x = (xy.x * this.xScale) + this.zero;
            let y = xy.y * this.yScale;
            return point(this.c.x + (Math.cos(x) * y), this.c.y + (Math.sin(x) * y));
        };

        rl.textTransform = function (xy, leftOrRight) {
            let p = this.xy(xy);
            let angle = ((xy.x * this.xScale) + this.zero) * (180.0 / Math.PI);
            while (angle > 90) { angle -= 180; leftOrRight *= -1; }
            while (angle < -90) { angle += 180; leftOrRight *= -1; }
            let svg = (leftOrRight < 0) ? labelStyle.LEFT : labelStyle.RIGHT;
            svg += 'transform="rotate(' + angle + ', ' + p.x + ', ' + p.y + ') translate(' + (leftOrRight * nodeRadius * 1.5) + ', 0)"';
            return svg;
        };

        return rl;
    };

    // various layouts supported by the tree renderer
    let layouts = {
        "Linear-Vertical": linearLayout({
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / treeWidth;
                this.yScale = displayHeight / (treeDepth + textPostSpacing);
            },
            "xy": function (xy) {
                return point(xy.x * this.xScale, xy.y * this.yScale);
            },
            "textTransform": function (xy, leftOrRight) {
                let p = this.xy(xy);
                let svg = (leftOrRight == TextPlacement.LEFT) ? labelStyle.LEFT : labelStyle.RIGHT;
                svg += 'transform="rotate(90, ' + p.x + ', ' + p.y + ') translate(' + (leftOrRight * nodeRadius * 1.5) + ', 0)"';
                return svg;
            }
        }),
        "Linear-Horizontal": linearLayout({
            "setup": function (treeWidth, treeDepth) {
                this.xScale = displayWidth / (treeDepth + textPostSpacing);
                this.yScale = displayHeight / treeWidth;
            },
            "xy": function (xy) {
                return point(xy.y * this.xScale, displayHeight - (xy.x * this.yScale));
            },
            "textTransform": function (xy, leftOrRight) {
                let svg = (leftOrRight == TextPlacement.LEFT) ? labelStyle.LEFT : labelStyle.RIGHT;
                svg += 'transform="translate(' + (leftOrRight * nodeRadius * 1.5) + ', 0)"';
                return svg;
            }
        }),
        "Radial": radialLayout({
            "setup": function (treeWidth, treeDepth) {
                this.zero = 0.0;
                this.xScale = (Math.PI * -2.0) / (treeWidth + 1);
                this.yScale = (displayHeight * 0.5) / (treeDepth + textPostSpacing);
                this.c = point(displayWidth * 0.5, displayHeight * 0.5);
            },
            "drawRow": function (i) {
                let r = i * this.yScale;
                return '<circle cx="' + this.c.x + '" cy="' + this.c.y + '" r="' + r + '" class="tree-svg-row" />';
            }
        }),
        "Arc-Vertical": radialLayout({
            "setup": function (treeWidth, treeDepth) {
                let angle = Math.asin((displayWidth * 0.5) / displayHeight) * 2.0;
                this.zero = Math.PI - ((Math.PI - angle) / 2.0);
                this.xScale = -angle / treeWidth;
                this.yScale = displayHeight / (treeDepth + textPostSpacing);
                this.c = point(displayWidth * 0.5, 0.0);
            }
        }),
        "Arc-Horizontal": radialLayout({
            "setup": function (treeWidth, treeDepth) {
                let angle = Math.asin((displayHeight * 0.5) / displayWidth) * 2.0;
                this.zero = angle / 2.0;
                this.xScale = -angle / treeWidth;
                this.yScale = displayWidth / (treeDepth + textPostSpacing);
                this.c = point(0.0, displayHeight * 0.5);
            }
        })
    };

    // functions to get a list of available layout names
    _.getLayouts = function () {
        let layoutNames = [];
        for (let layoutName in layouts) {
            if (layouts.hasOwnProperty(layoutName)) {
                layoutNames.push(layoutName);
            }
        }
        layoutNames.sort();
        return layoutNames;
    };

    // render with an adapter (an object that links externally defined values
    // to the display characteristics of the node)
    _.renderSvg = function (root, layoutName, adapter) {
        // create the raw SVG picture for display, assumes a width/height aspect ratio of 3/2
        let svg = '<div class="tree-svg-div">';
        svg += '<svg class="tree-svg-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" ';

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

        // recursive depth check
        let recursiveDepthCheck = function (depth, container) {
            container.depth = depth;
            let nextDepth = depth + 1;
            for (let i = 0, childCount = container.children.length; i < childCount; ++i) {
                recursiveDepthCheck(nextDepth, container.children[i]);
            }
        };
        recursiveDepthCheck(0, root);

        // function to see if we should traverse further in the tree
        let getShowChildren = function (container) {
            return (container.children.length == 0) || container.expanded;
        }

        // recursive layout in uniform scale space
        let depth = 1;
        let recursiveLayout = function (x, y, container) {
            let childX = x;
            if (getShowChildren(container)) {
                let childCount = container.children.length;
                if (childCount > 0) {
                    let nextY = y + 1;
                    childX = recursiveLayout(x, nextY, container.children[0]);
                    for (let i = 1; i < childCount; ++i) {
                        childX = recursiveLayout(childX + 1, nextY, container.children[i]);
                    }
                }
            }

            // compute layout
            if (container.node != null) {
                container.x = (x + childX) / 2.0;
                container.y = y;
            }
            depth = Math.max(depth, y);
            return childX;
        };
        let width = recursiveLayout(0, (root.node == null) ? -1 : 0, root);

        // setup the layout object with the computed tree properties
        let layout = (layoutName in layouts) ? layouts[layoutName] : layouts["Linear-Vertical"];
        layout.setup(width, depth);

        // draw the rows
        for (let i = 0; i <= depth; ++i) {
            svg += layout.drawRow(i);
        }

        // draw the edges, cubic bezier style
        let interpolate = function (a, b, i) { return (a * i) + (b * (1.0 - i)); };
        let recursiveDrawEdges = function (container) {
            if (getShowChildren(container)) {
                for (let i = 0, childCount = container.children.length; i < childCount; ++i) {
                    let child = container.children[i];
                    recursiveDrawEdges(child);
                    if (container.node != null) {
                        let c1 = point(container.x, interpolate(child.y, container.y, edgeTension));
                        let c2 = point(child.x, interpolate(container.y, child.y, edgeTension));
                        let f = layout.xy(container), t = layout.xy(child), m1 = layout.xy(c1), m2 = layout.xy(c2);
                        svg += '<path class="tree-svg-edge" ';
                        svg += 'd="M' + f.x + ',' + f.y + ' C' + m1.x + ',' + m1.y + ' ' + m2.x + ',' + m2.y + ' ' + t.x + ',' + t.y + '" ';
                        svg += '/>';
                    }
                }
            }
        };
        recursiveDrawEdges(root);

        // draw the nodes
        let recursiveDrawNodes = function (container) {
            if (getShowChildren(container)) {
                for (let i = 0, childCount = container.children.length; i < childCount; ++i) {
                    recursiveDrawNodes(container.children[i]);
                }
            }
            if (container.node != null) {
                let title = adapter.getTitle(container);

                // create an SVG group, with a click handler, note that the
                // browsers all handle this differently (of course) - so we
                // go with the W3C way, and only handle click events
                svg += '<g onclick="onTreeClick({ id:' + container.id + ', event:evt });">';

                // add a node as a circle
                svg += '<circle title="' + title + '" ';
                let p = layout.xy(container);
                svg += 'cx="' + p.x + '" cy="' + p.y + '" r="' + nodeRadius + '" ';
                svg += 'class="' + (getShowChildren(container) ? 'tree-svg-node' : 'tree-svg-node-expandable') + '" ';

                // this will override the class definition if fill was not
                // *EVER*specified - useful for programmatic control
                svg += 'fill="' + adapter.getColor(container) + '" ';
                svg += '/>';

                // add the text description of the node
                if (drawLabels) {
                    svg += '<text x="' + p.x + '" y="' + p.y + '" ';
                    svg += 'class="tree-svg-node-title" '
                    if ((container.children.length == 0) || (!container.expanded)) {
                        svg += layout.textTransform(container, TextPlacement.RIGHT) + ' ';
                    } else {
                        svg += layout.textTransform(container, TextPlacement.LEFT) + ' ';
                    }

                    // trim the title to a displayable length
                    if (title.length > labelLength) {
                        title = title.substring(0, labelLength - 1) + "&hellip;";
                    }
                    svg += '><tspan dy="0.33em">' + title + '</tspan></text>';
                }

                // close the SVG group
                svg += '</g>';
            }
        };
        recursiveDrawNodes(root);

        // close the plot
        svg += "</div><br>";
        return svg;
    };

    _.getDefaultAdapter = function () {
        return {
            getTitle: function (container) { return "" + container.id; },
            getColor: function (container) { return "red"; }
        };
    };

    return _;
}();
