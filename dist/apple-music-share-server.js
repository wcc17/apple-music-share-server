"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var listener_service_1 = require("./service/listener-service");
var AppleMusicShareServer = /** @class */ (function () {
    function AppleMusicShareServer() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
        this.listenerService = new listener_service_1.ListenerService();
        // this.emitService = new EmitService(this.listenerService.getRoomQueues(), 
        //     this.listenerService.getRoomUsers(), this.io.sockets.adapter.rooms, this.io);
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
        //TODO: should not accept any messages dated before server start time. would need to be sending a timestamp from client
        //TODO: should disconnect any users trying to send messages that don't have a roomID (unless its create or join room of course)
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', function (socket) {
            try {
                //we can set these values here because each socket is mapped to one user
                var userId_1 = undefined;
                var roomId_1 = undefined;
                console.log('Connected client on port %s.', _this.port);
                socket.on('join-room', function (m) {
                    _this.listenerService.handleJoinRoom(_this.io, m, socket);
                });
                socket.on('create-room', function (m) {
                    var user = _this.listenerService.handleCreateRoom(_this.io, m, socket);
                    userId_1 = user.getId();
                    roomId_1 = user.getRoomId();
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
                socket.on('client-update', function (m) {
                    _this.listenerService.handleClientUpdate(_this.io, m, socket);
                });
                socket.on('disconnect', function (m) {
                    if (userId_1 && roomId_1) {
                        _this.listenerService.handleClientDisconnect(_this.io, userId_1, roomId_1);
                    }
                    console.log('Client disconnected');
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    };
    AppleMusicShareServer.prototype.getApp = function () {
        return this.app;
    };
    AppleMusicShareServer.PORT = 8080;
    return AppleMusicShareServer;
}());
exports.AppleMusicShareServer = AppleMusicShareServer;
