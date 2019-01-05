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
    Message.prototype.getAction = function () {
        return this.action;
    };
    Message.prototype.setDebugMessage = function (debugMessage) {
        this.debugMessage = debugMessage;
    };
    return Message;
}());
exports.Message = Message;
