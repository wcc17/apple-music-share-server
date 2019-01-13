"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(user) {
        this.isLeader = false;
        this.id = user.id;
        this.name = user.name;
        this.roomId = user.roomId;
        this.isLeader = user.isLeader;
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
    User.prototype.getIsLeader = function () {
        return this.isLeader;
    };
    User.prototype.setIsLeader = function (isLeader) {
        this.isLeader = isLeader;
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
