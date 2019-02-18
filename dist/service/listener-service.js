"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var message_1 = require("../model/message");
var client_update_message_1 = require("../model/client-update-message");
var room_service_1 = require("./room-service");
var user_service_1 = require("./user-service");
var ListenerService = /** @class */ (function () {
    function ListenerService() {
        this.roomService = new room_service_1.RoomService();
        this.userService = new user_service_1.UserService();
    }
    ListenerService.prototype.handleCreateRoom = function (io, m, socket) {
        var debugMessage = '';
        var message = new message_1.Message(m);
        var isValidUser = this.userService.checkForValidUserInMessageIgnoreRoomId(message);
        if (isValidUser) {
            debugMessage = 'created room';
            var roomId = this.roomService.getNextRoomId(io);
            message.getFromUser().setIsLeader(true);
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(debugMessage);
            socket.join(roomId);
            this.roomService.addRoom(roomId.toString());
            this.roomService.addUserToRoom(roomId.toString(), message.getFromUser());
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        }
        else {
            debugMessage = 'failed to create room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }
        this.logMessage(message.getFromUser(), null, debugMessage);
    };
    ListenerService.prototype.handleJoinRoom = function (io, m, socket) {
        var debugMessage = '';
        var message = new message_1.Message(m);
        var roomId = message.getFromUser().getRoomId();
        if (this.isValidRequest(io, roomId, message)) {
            debugMessage = 'joined room';
            this.roomService.addUserToRoom(message.getFromUser().getRoomId().toString(), message.getFromUser());
            socket.join(message.getFromUser().getRoomId());
            message.setDebugMessage(debugMessage);
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        }
        else {
            debugMessage = 'failed to join room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }
        this.logMessage(message.getFromUser(), roomId, debugMessage);
    };
    ListenerService.prototype.handleMessage = function (io, m) {
        var debugMessage = '';
        var message = new message_1.Message(m);
        var roomId = message.getFromUser().getRoomId();
        if (this.isValidRequest(io, roomId, message)) {
            debugMessage = m.content;
            message.setDebugMessage(debugMessage);
            this.emitMessageToRoom(io, roomId.toString(), 'message', message);
        }
        else {
            debugMessage = 'failed to process message';
        }
        this.logMessage(message.getFromUser(), roomId, debugMessage);
    };
    ListenerService.prototype.handleQueue = function (io, m, song) {
        var debugMessage = '';
        var message = new message_1.Message(m);
        var roomId = message.getFromUser().getRoomId();
        if (this.isValidRequest(io, roomId, message)) {
            this.roomService.addSongToQueue(roomId.toString(), song);
            debugMessage = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomService.getRoomQueue(roomId.toString()));
            this.emitMessageToRoom(io, roomId.toString(), 'queue', message);
        }
        else {
            debugMessage = 'failed to queue song';
        }
        this.logMessage(message.getFromUser(), roomId, debugMessage);
    };
    ListenerService.prototype.handleQueueRequest = function (io, m) {
        var debugMessage = '';
        var message = new message_1.Message(m);
        var roomId = message.getFromUser().getRoomId();
        var userId = message.getFromUser().getId();
        var userName = message.getFromUser().getName();
        if (this.isValidRequest(io, roomId, message)) {
            debugMessage = 'requested the current queue';
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomService.getRoomQueue(roomId.toString()));
            this.emitMessageToRoom(io, roomId.toString(), 'queue', message);
        }
        else {
            debugMessage = 'queue request failed';
        }
        this.logMessage(message.getFromUser(), roomId, debugMessage);
    };
    ListenerService.prototype.handleClientUpdate = function (io, m) {
        var debugMessage = '';
        var message = new client_update_message_1.ClientUpdateMessage(m);
        var clientUser = message.getFromUser();
        var roomId = message.getFromUser().getRoomId();
        if (this.isValidRequest(io, roomId, message)) {
            debugMessage = 'is sending up to date info to server';
            var currentServerUser = this.roomService.getUserFromRoom(roomId.toString(), clientUser.getId());
            var leaderServerUser = this.roomService.getLeaderFromRoom(roomId.toString());
            if (leaderServerUser) {
                if (currentServerUser.getId() === leaderServerUser.getId()) {
                    var queue = this.roomService.getRoomQueue(roomId.toString());
                    if (message.getRemoveMostRecentSong()) {
                        queue.shift();
                        this.emitMessageToRoom(io, roomId.toString(), 'queue', message); //give everyone the latest queue
                    }
                    message.setCurrentQueue(queue);
                    message.setDebugMessage(debugMessage);
                    this.emitMessageToRoom(io, roomId.toString(), 'leader-update', message);
                }
            }
        }
        else {
            debugMessage = 'client update request failed';
        }
        this.logMessage(clientUser, roomId, debugMessage);
    };
    ListenerService.prototype.isValidRequest = function (io, roomId, message) {
        var isValidUser = this.userService.checkForValidUserInMessage(message);
        var isValidRoom = this.roomService.checkExistingRoom(io, roomId);
        return (isValidUser && isValidRoom);
    };
    ListenerService.prototype.emitMessageToRoom = function (io, roomId, event, message) {
        io.sockets.in(roomId).emit(event, message);
    };
    ListenerService.prototype.logMessage = function (user, roomId, message) {
        var userId = (user && user.getId()) ? user.getId().toString() : 'not provided';
        var userName = (user && user.getName()) ? user.getName() : 'not provided';
        var isLeader = (user && user.getIsLeader()) ? "Yes" : "No";
        var roomIdString = (roomId) ? roomId.toString() : 'not provided';
        var messageString = (message) ? message : 'not provided';
        console.log('[%s][userId: %s][userName: %s][isLeader: %s][roomId: %s][message: %s]', new Date().toUTCString(), userId, userName, isLeader, roomIdString, messageString);
    };
    return ListenerService;
}());
exports.ListenerService = ListenerService;
