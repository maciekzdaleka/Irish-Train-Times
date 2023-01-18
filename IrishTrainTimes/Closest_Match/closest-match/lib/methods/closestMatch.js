"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closestMatch = void 0;
var distance_1 = require("./distance");
var closestMatch = function (target, array, showOccurrences) {
    if (showOccurrences === void 0) { showOccurrences = false; }
    if (array.length === 0)
        return null;
    var vals = [];
    var found = [];
    for (var i = 0; i < array.length; i++)
        vals.push((0, distance_1.distance)(target, array[i]));
    var min = Math.min.apply(Math, vals);
    for (var i = 0; i < vals.length; i++) {
        if (vals[i] === min)
            found.push(array[i]);
    }
    return showOccurrences ? found : found[0];
};
exports.closestMatch = closestMatch;