"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var message_1 = require("./model/message");
var action_1 = require("./model/action");
var AppleMusicShareServer = /** @class */ (function () {
    function AppleMusicShareServer() {
        this.queue = [];
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }
    AppleMusicShareServer.prototype.createApp = function () {
        this.app = express();
    };
    AppleMusicShareServer.prototype.createServer = function () {
        this.server = http_1.createServer(this.app);
    };
    AppleMusicShareServer.prototype.config = function () {
        this.port = process.env.PORT || AppleMusicShareServer.PORT;
    };
    AppleMusicShareServer.prototype.sockets = function () {
        this.io = socketIo(this.server);
    };
    AppleMusicShareServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            console.log('Connected client on port %s.', _this.port);
            socket.on('message', function (m) {
                _this.handleMessage(m);
            });
            socket.on('queue', function (m) {
                _this.handleQueue(m, m.content);
            });
            socket.on('queue-request', function (m) {
                _this.handleQueueRequest(m);
            });
            socket.on('disconnect', function () {
                console.log('Client disconnected');
            });
        });
    };
    AppleMusicShareServer.prototype.handleMessage = function (m) {
        var message = new message_1.Message(m);
        message.setDebugMessage(m.content);
        console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);
        this.io.emit('message', message);
    };
    AppleMusicShareServer.prototype.handleQueue = function (m, song) {
        var message = new message_1.Message(m);
        var debugMessage = ': queued the song '
            + song.attributes.name
            + ' by ' + song.attributes.artistName;
        console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
        this.queue.push(song);
        message.setDebugMessage(debugMessage);
        message.setCurrentQueue(this.queue);
        this.io.emit('queue', message);
    };
    AppleMusicShareServer.prototype.handleQueueRequest = function (m) {
        var message = new message_1.Message(m);
        var debugMessage = ': requested the current queue';
        console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
        message.setAction(action_1.Action.QUEUE);
        message.setDebugMessage(debugMessage);
        message.setCurrentQueue(this.queue);
        this.io.emit('queue', message);
    };
    AppleMusicShareServer.prototype.getApp = function () {
        return this.app;
    };
    AppleMusicShareServer.PORT = 8080;
    return AppleMusicShareServer;
}());
exports.AppleMusicShareServer = AppleMusicShareServer;
