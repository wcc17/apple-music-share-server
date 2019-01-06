"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(user) {
        this.id = user.id;
        this.name = user.name;
        this.roomId = user.roomId;
    }
    User.prototype.getId = function () {
        return this.id;
    };
    User.prototype.getName = function () {
        return this.name;
    };
    User.prototype.getRoomId = function () {
        return this.roomId;
    };
    User.prototype.setRoomId = function (roomId) {
        this.roomId = roomId;
    };
    User.prototype.isValidUser = function () {
        if (this.id && this.name && this.roomId) {
            return true;
        }
        return false;
    };
    return User;
}());
exports.User = User;
