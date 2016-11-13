"use strict;"

let Circle = function () {
    let _ = Object.create (null);

    _.construct = function (p, r) {
        this.p = p;
        this.r = r;
    };

    _.area = function () {
        return Math.PI * this.r * this.r;
    };

    _.new = function (p, r) {
        return Object.create (_).construct (p, r);
    };

    return _;
} ();

