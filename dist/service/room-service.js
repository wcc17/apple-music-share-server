"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_1 = require("../util/dictionary");
var RoomService = /** @class */ (function () {
    function RoomService() {
        this.roomQueues = new dictionary_1.JSDictionary();
        this.roomUsers = new dictionary_1.JSDictionary();
        this.roomId = 100000;
    }
    RoomService.prototype.addRoom = function (roomId) {
        this.roomQueues.put(roomId.toString(), []);
    };
    RoomService.prototype.addSongToQueue = function (key, song) {
        this.addObjectToQueue(key, song, this.roomQueues);
    };
    RoomService.prototype.addUserToRoom = function (socket, roomId, user) {
        socket.join(roomId);
        this.addObjectToQueue(roomId, user, this.roomUsers);
    };
    RoomService.prototype.getRoomQueue = function (roomId) {
        return this.roomQueues.get(roomId.toString());
    };
    RoomService.prototype.setRoomQueue = function (roomId, queue) {
        this.roomQueues.put(roomId.toString(), queue);
    };
    RoomService.prototype.getRoomUsers = function (roomId) {
        var users = this.roomUsers.get(roomId.toString());
        if (users) {
            return users;
        }
        else {
            return [];
        }
    };
    RoomService.prototype.getUserFromRoom = function (roomId, userId) {
        var users = this.getRoomUsers(roomId);
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            if (user.getId() === userId) {
                return user;
            }
        }
        return null;
    };
    RoomService.prototype.getLeaderFromRoom = function (roomId) {
        var users = this.getRoomUsers(roomId);
        for (var _i = 0, users_2 = users; _i < users_2.length; _i++) {
            var user = users_2[_i];
            if (user.getIsLeader()) {
                return user;
            }
        }
        return null;
    };
    RoomService.prototype.promoteUserToLeaderInRoom = function (newLeaderUser, roomId) {
        var users = this.getRoomUsers(roomId);
        users.forEach(function (user, index) {
            if (newLeaderUser.getId() === user.getId()) {
                users[index].setIsLeader(true);
            }
        });
    };
    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    //TODO: this is stupid right
    RoomService.prototype.getNextRoomId = function (io) {
        this.roomId++;
        while (this.checkExistingRoom(io, this.roomId)) {
            this.roomId++;
        }
        return this.roomId;
    };
    RoomService.prototype.checkExistingRoom = function (io, roomId) {
        var rooms = this.getSocketRooms(io);
        if (roomId && rooms[roomId]) {
            return true;
        }
        return false;
    };
    RoomService.prototype.removeUserFromRoom = function (userId, roomId) {
        var users = this.getRoomUsers(roomId.toString());
        var i = users.length;
        while (i--) {
            if (users[i].getId() === userId) {
                users.splice(i, 1);
                break;
            }
        }
    };
    RoomService.prototype.handleDisconnectedUser = function (io, socket, user, roomId) {
        //there is a chance here that the client will still be sending updates, but will have been disconnected
        //if the client is sending a user id and a room id:
        //check if the room exists. If so, join the room
        //if the room does not exist, create the room, make the user the leader and move on. Make sure to keep the client's copy of the queue if possible
        var roomExists = this.checkExistingRoom(io, roomId);
        if (roomExists) {
            user.setIsLeader(false);
        }
        else {
            user.setIsLeader(true);
            this.addRoom(roomId.toString());
        }
        this.addUserToRoom(socket, roomId.toString(), user);
        return user;
    };
    RoomService.prototype.addObjectToQueue = function (key, obj, queue) {
        if (queue.get(key)) {
            var arr = queue.get(key);
            if (arr) {
                arr.push(obj);
            }
            else {
                arr = [obj];
            }
            queue.put(key, arr);
        }
        else {
            queue.put(key, [obj]);
        }
    };
    RoomService.prototype.getSocketRooms = function (io) {
        return io.sockets.adapter.rooms;
    };
    return RoomService;
}());
exports.RoomService = RoomService;
