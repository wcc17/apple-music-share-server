"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var message_1 = require("./message");
var PlaybackState;
(function (PlaybackState) {
    PlaybackState[PlaybackState["NONE"] = 0] = "NONE";
    PlaybackState[PlaybackState["LOADING"] = 1] = "LOADING";
    PlaybackState[PlaybackState["PLAYING"] = 2] = "PLAYING";
    PlaybackState[PlaybackState["PAUSED"] = 3] = "PAUSED";
    PlaybackState[PlaybackState["STOPPED"] = 4] = "STOPPED";
    PlaybackState[PlaybackState["ENDED"] = 5] = "ENDED";
    PlaybackState[PlaybackState["SEEKING"] = 6] = "SEEKING";
    PlaybackState[PlaybackState["NULL"] = 7] = "NULL";
    PlaybackState[PlaybackState["WAITING"] = 8] = "WAITING";
    PlaybackState[PlaybackState["STALLED"] = 9] = "STALLED";
    PlaybackState[PlaybackState["COMPLETED"] = 10] = "COMPLETED";
})(PlaybackState = exports.PlaybackState || (exports.PlaybackState = {}));
var ClientUpdateMessage = /** @class */ (function (_super) {
    __extends(ClientUpdateMessage, _super);
    function ClientUpdateMessage(message) {
        var _this = _super.call(this, message) || this;
        _this.currentPlaybackTime = message.currentPlaybackTime;
        _this.currentPlaybackDuration = message.currentPlaybackDuration;
        _this.currentPlaybackState = message.currentPlaybackState;
        return _this;
    }
    ClientUpdateMessage.prototype.getCurrentPlaybackTime = function () {
        return this.currentPlaybackTime;
    };
    ClientUpdateMessage.prototype.getCurrentPlaybackDuration = function () {
        return this.currentPlaybackDuration;
    };
    ClientUpdateMessage.prototype.getCurrentPlaybackState = function () {
        return this.currentPlaybackState;
    };
    return ClientUpdateMessage;
}(message_1.Message));
exports.ClientUpdateMessage = ClientUpdateMessage;
