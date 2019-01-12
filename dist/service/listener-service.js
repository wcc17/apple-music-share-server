"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var message_1 = require("../model/message");
var dictionary_1 = require("../util/dictionary");
var ListenerService = /** @class */ (function () {
    function ListenerService() {
        this.roomQueues = new dictionary_1.JSDictionary();
        this.roomId = 100000;
    }
    ListenerService.prototype.handleCreateRoom = function (io, m, socket) {
        var message = new message_1.Message(m);
        if (message
            && message.getFromUser()
            && message.getFromUser().getId()
            && message.getFromUser().getName()) {
            var roomId = this.getNextRoomId(io.sockets.adapter.rooms);
            socket.join(roomId);
            //TODO: should I just do this before accessing the queue? Instead of relying on it being initialized here?
            this.roomQueues[roomId] = [];
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(message.getFromUser().getName() + ' created room with id: ' + roomId);
            io.sockets.in(roomId.toString()).emit('room-joined', message);
            console.log('[server](message): %s', message.getDebugMessage());
        }
    };
    ListenerService.prototype.handleJoinRoom = function (io, m, socket) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        var roomExists = this.checkExistingRoom(io.sockets.adapter.rooms, message.getFromUser().getRoomId());
        if (isValid && roomExists) {
            message.setDebugMessage(message.getFromUser().getName() + ' joined room with id: ' + message.getFromUser().getRoomId());
            socket.join(message.getFromUser().getRoomId());
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-joined', message);
            console.log('[server](message): %s', message.getDebugMessage());
        }
        if (!roomExists) {
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-not-joined', message);
        }
    };
    ListenerService.prototype.handleMessage = function (io, m) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            message.setDebugMessage(m.content);
            console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('message', message);
        }
    };
    ListenerService.prototype.handleQueue = function (io, m, song) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            var debugMessage = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
            var roomId = message.getFromUser().getRoomId();
            this.roomQueues[roomId].push(song);
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues[roomId]);
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    };
    ListenerService.prototype.handleQueueRequest = function (io, m) {
        var message = new message_1.Message(m);
        var isValid = this.checkForValidRequest(message);
        if (isValid) {
            var debugMessage = ': requested the current queue';
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
            var roomId = message.getFromUser().getRoomId();
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues[roomId]);
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    };
    ListenerService.prototype.checkForValidRequest = function (message) {
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
    ListenerService.prototype.checkExistingRoom = function (rooms, roomId) {
        if (rooms[roomId]) {
            return true;
        }
        return false;
    };
    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    ListenerService.prototype.getNextRoomId = function (rooms) {
        this.roomId++;
        while (this.checkExistingRoom(rooms, this.roomId)) {
            this.roomId++;
        }
        return this.roomId;
    };
    return ListenerService;
}());
exports.ListenerService = ListenerService;
