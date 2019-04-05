"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(user) {
        this.isLeader = false;
        this.hasVotedForCurrentSong = false;
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
    User.prototype.getCurrentPlaybackTime = function () {
        return this.currentPlaybackTime;
    };
    User.prototype.setCurrentPlaybackTime = function (playbackTime) {
        this.currentPlaybackTime = playbackTime;
    };
    User.prototype.getCurrentPlaybackDuration = function () {
        return this.currentPlaybackDuration;
    };
    User.prototype.setCurrentPlaybackDuration = function (playbackDuration) {
        this.currentPlaybackDuration = playbackDuration;
    };
    User.prototype.getCurrentPlaybackState = function () {
        return this.currentPlaybackState;
    };
    User.prototype.setCurrentPlaybackState = function (playbackState) {
        this.currentPlaybackState = playbackState;
    };
    User.prototype.setHasVotedForCurrentSong = function (hasVoted) {
        this.hasVotedForCurrentSong = hasVoted;
    };
    User.prototype.getHasVotedForCurrentSong = function () {
        return this.hasVotedForCurrentSong;
    };
    return User;
}());
exports.User = User;
