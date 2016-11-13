"use strict;"

let Circle = function () {
    let _ = Object.create (null);

    _.construct = function (p, r) {
        this.p = p;
        this.r = r;
        return this;
    };

    _.area = function () {
        return Math.PI * this.r * this.r;
    };

    _.new = function (p, r) {
        return Object.create (_).construct (p, r);
    };

    return _;
} ();

