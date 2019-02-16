"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VALIDATE_ROOM_ID = true;
var UserService = /** @class */ (function () {
    function UserService() {
    }
    UserService.prototype.checkForValidUserInMessage = function (message) {
        if (message && message.getFromUser()) {
            return this.checkForValidUser(message.getFromUser(), VALIDATE_ROOM_ID);
        }
        return false;
    };
    UserService.prototype.checkForValidUserInMessageIgnoreRoomId = function (message) {
        if (message && message.getFromUser()) {
            return this.checkForValidUser(message.getFromUser(), !VALIDATE_ROOM_ID);
        }
        return false;
    };
    UserService.prototype.checkForValidUser = function (user, validateRoomId) {
        if (validateRoomId) {
            return this.isValidUser(user);
        }
        else {
            return this.isValidUserIgnoreRoomId(user);
        }
    };
    UserService.prototype.isValidUser = function (user) {
        if (user.getId() && user.getName() && user.getRoomId()) {
            return true;
        }
        return false;
    };
    UserService.prototype.isValidUserIgnoreRoomId = function (user) {
        if (user.getId() && user.getName()) {
            return true;
        }
        return false;
    };
    return UserService;
}());
exports.UserService = UserService;
