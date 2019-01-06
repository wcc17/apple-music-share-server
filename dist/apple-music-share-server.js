"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var express = require("express");
var socketIo = require("socket.io");
var message_1 = require("./model/message");
var AppleMusicShareServer = /** @class */ (function () {
    function AppleMusicShareServer() {
        this.roomId = 100000;
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
            socket.on('join-room', function (m) {
                _this.handleJoinRoom(m, socket);
            });
            socket.on('create-room', function (m) {
                _this.handleCreateRoom(m, socket);
            });
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
    AppleMusicShareServer.prototype.handleCreateRoom = function (m, socket) {
        var message = new message_1.Message(m);
        if (message
            && message.getFromUser()
            && message.getFromUser().getId()
            && message.getFromUser().getName()) {
            var roomId = this.getNextRoomId();
            socket.join(roomId);
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(message.getFromUser().getName() + ' created room with id: ' + roomId);
            this.io.sockets.in(roomId.toString()).emit('room-joined', message);
            console.log('[server](message): %s', message.getDebugMessage());
        }
    };
    AppleMusicShareServer.prototype.handleJoinRoom = function (m, socket) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        var roomExists = this.checkExistingRoom(message.getFromUser().getRoomId());
        if (isValid && roomExists) {
            message.setDebugMessage(message.getFromUser().getName() + ' joined room with id: ' + message.getFromUser().getRoomId);
            socket.join(message.getFromUser().getRoomId());
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-joined', message);
            console.log('[server](message): %s', message.getDebugMessage());
        }
        if (!roomExists) {
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-not-joined', message);
        }
    };
    AppleMusicShareServer.prototype.handleMessage = function (m) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            message.setDebugMessage(m.content);
            console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('message', message);
        }
    };
    AppleMusicShareServer.prototype.handleQueue = function (m, song) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            var debugMessage = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
            this.queue.push(song);
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.queue);
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    };
    AppleMusicShareServer.prototype.handleQueueRequest = function (m) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            var debugMessage = ': requested the current queue';
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.queue);
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    };
    AppleMusicShareServer.prototype.checkForValidRequest = function (message) {
        if (message
            && message.getFromUser()
            && message.getFromUser().isValidUser()) {
            return true;
        }
        if (message.getFromUser() && message.getFromUser().getName()) {
            console.log('User ' + message.getFromUser().getName() + ' made a request with missing info');
        }
        else {
            console.log('User made a request with missing info');
        }
        return false;
    };
    AppleMusicShareServer.prototype.checkExistingRoom = function (roomId) {
        if (this.io.sockets.adapter.rooms[roomId]) {
            return true;
        }
        return false;
    };
    AppleMusicShareServer.prototype.getNextRoomId = function () {
        this.roomId++;
        while (this.checkExistingRoom(this.roomId)) {
            this.roomId++;
        }
        return this.roomId;
    };
    AppleMusicShareServer.prototype.getApp = function () {
        return this.app;
    };
    AppleMusicShareServer.PORT = 8080;
    return AppleMusicShareServer;
}());
exports.AppleMusicShareServer = AppleMusicShareServer;
