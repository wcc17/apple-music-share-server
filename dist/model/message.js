"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var user_1 = require("./user");
var Message = /** @class */ (function () {
    function Message(message) {
        this.from = new user_1.User(message.from);
        this.action = message.action;
    }
    Message.prototype.getFromUser = function () {
        return this.from;
    };
    Message.prototype.setFromUser = function (user) {
        this.from = user;
    };
    Message.prototype.getAction = function () {
        return this.action;
    };
    Message.prototype.setAction = function (action) {
        this.action = action;
    };
    Message.prototype.getDebugMessage = function () {
        return this.debugMessage;
    };
    Message.prototype.setDebugMessage = function (debugMessage) {
        this.debugMessage = debugMessage;
    };
    Message.prototype.getCurrentQueue = function () {
        return this.currentQueue;
    };
    Message.prototype.setCurrentQueue = function (queue) {
        this.currentQueue = queue;
    };
    Message.prototype.getVoteCount = function () {
        return this.voteCount;
    };
    Message.prototype.setVoteCount = function (voteCount) {
        this.voteCount = voteCount;
    };
    return Message;
}());
exports.Message = Message;
