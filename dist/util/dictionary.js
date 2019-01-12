"use strict";
//https://codereview.stackexchange.com/questions/134030/typescript-dictionary-class
Object.defineProperty(exports, "__esModule", { value: true });
var JSDictionary = /** @class */ (function () {
    function JSDictionary() {
        this.internalDict = {};
    }
    JSDictionary.prototype.getKeys = function () {
        var keys = [];
        for (var key in this.internalDict) {
            keys.push(key);
        }
        return keys;
    };
    // Type predicate to ensure v exists
    JSDictionary.prototype.exists = function (v) {
        return v != null && typeof v !== "undefined";
    };
    JSDictionary.prototype.getValues = function () {
        var vals = [];
        for (var key in this.internalDict) {
            var v = this.internalDict[key];
            if (this.exists(v)) {
                vals.push(v);
            }
        }
        return vals;
    };
    JSDictionary.prototype.get = function (key) {
        var v = this.internalDict[key];
        return this.exists(v)
            ? v
            : null;
    };
    JSDictionary.prototype.put = function (key, val) {
        this.internalDict[key] = val;
    };
    return JSDictionary;
}());
exports.JSDictionary = JSDictionary;
