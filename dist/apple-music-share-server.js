"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var listener_service_1 = require("./service/listener-service");
var AppleMusicShareServer = /** @class */ (function () {
    function AppleMusicShareServer() {
        this.listenerService = new listener_service_1.ListenerService();
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
            socket.on('join-room', function (m) {
                _this.listenerService.handleJoinRoom(_this.io, m, socket);
            });
            socket.on('create-room', function (m) {
                _this.listenerService.handleCreateRoom(_this.io, m, socket);
            });
            socket.on('message', function (m) {
                _this.listenerService.handleMessage(_this.io, m);
            });
            socket.on('queue', function (m) {
                _this.listenerService.handleQueue(_this.io, m, m.content);
            });
            socket.on('queue-request', function (m) {
                _this.listenerService.handleQueueRequest(_this.io, m);
            });
            socket.on('disconnect', function () {
                //TODO: do I need to disconnect this particular user from the room they're in?
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
