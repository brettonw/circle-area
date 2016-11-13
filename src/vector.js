"use strict;"

let Vector2 = function () {
    let _ = Object.create (null);

    _.add = function (left, right) {
        return Vec2.new (left.x + right.x, left.y + right.y);
    };

    _.subtract = function (left, right) {
        return Vec2.new (left.x - right.x, left.y - right.y);
    };

    _.scale = function (left, right) {
        return Vec2.new (left.x * right, left.y * right);
    };

    _.dot = function (left, right) {
        return (left.x * right.x) + (left.y * right.y);
    };

    _.normSq = function (left) {
        return (left.x * left.x) + (left.y * left.y);
    };

    _.norm = function (left) {
        return Math.sqrt ((left.x * left.x) + (left.y * left.y));
    };

    _.normalize = function (left) {
        return _.scale (left, 1.0 / _.norm (left));
    };

    return _;
} ();

let Vec2 = function () {
    let _ = Object.create (null);

    _.construct = function (array) {
        this.x = array[0];
        this.y = array[1];
    };

    _.add = function (right) {
        return Vector2.add (this, right);
    };

    _.subtract = function (right) {
        return Vector2.subtract (this, right);
    };

    _.scale = function (right) {
        return Vector2.scale (this, right);
    };

    _.dot = function (right) {
        return Vector2.dot (this, right);
    };

    _.normSq = function () {
        return Vector2.normSq (this);
    };

    _.norm = function () {
        return Vector2.norm (this);
    };

    _.normalize = function () {
        let norm = Vector2.normalize (this);
    };

    _.new = function (...params) {
        return Object.create (_).construct (params);
    };

    return _;
} ();

let V = function (...params) {
    return Vec2.new (params);
};
