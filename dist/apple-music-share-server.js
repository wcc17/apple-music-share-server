"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var message_1 = require("./model/message");
var action_1 = require("./model/action");
var AppleMusicShareServer = /** @class */ (function () {
    function AppleMusicShareServer() {
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
                var newMessage = new message_1.Message(m);
                switch (newMessage.getAction()) {
                    case action_1.Action.QUEUE:
                        var song = m.content;
                        //TODO: do something with the song
                        var debugMessage = newMessage.getFromUser().getName()
                            + ': queued the song '
                            + song.attributes.name
                            + ' by ' + song.attributes.artistName;
                        newMessage.setDebugMessage(debugMessage);
                        console.log('[server](message): %s', debugMessage);
                        break;
                    default:
                        var message = m.content;
                        console.log('[server](message): %s', newMessage.getFromUser().getName() + ': ' + message);
                        newMessage.setDebugMessage(message);
                        break;
                }
                _this.io.emit('message', newMessage);
            });
            socket.on('disconnect', function () {
                console.log('Client disconnected');
            });
        });
    };
    AppleMusicShareServer.prototype.getApp = function () {
        return this.app;
    };
    AppleMusicShareServer.PORT = 8080;
    return AppleMusicShareServer;
}());
exports.AppleMusicShareServer = AppleMusicShareServer;
