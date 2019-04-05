"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dictionary_1 = require("../util/dictionary");
var user_1 = require("../model/user");
var RoomService = /** @class */ (function () {
    function RoomService() {
        this.roomQueues = new dictionary_1.JSDictionary();
        this.roomUsers = new dictionary_1.JSDictionary();
        this.roomVotesToSkipDict = new dictionary_1.JSDictionary();
        this.roomId = 100000;
    }
    RoomService.prototype.addRoom = function (roomId) {
        this.roomQueues.put(roomId.toString(), []);
    };
    RoomService.prototype.addSongToQueue = function (roomId, song) {
        song.orderInQueue = this.getOrderInQueue(roomId, song);
        this.addObjectToQueue(roomId, song, this.roomQueues);
    };
    RoomService.prototype.addUserToRoom = function (socket, roomId, user) {
        socket.join(roomId);
        this.addObjectToQueue(roomId, user, this.roomUsers);
    };
    RoomService.prototype.getRoomQueue = function (roomId) {
        return this.roomQueues.get(roomId.toString());
    };
    RoomService.prototype.getRoomVotesToSkip = function (roomId) {
        return this.roomVotesToSkipDict.get(roomId.toString());
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
    RoomService.prototype.removeSongFromQueue = function (roomId, song) {
        if (this.roomQueues.get(roomId)) {
            var queue = this.roomQueues.get(roomId);
            var requestingUser = new user_1.User(song.requestedBy);
            var i = queue.length;
            while (i--) {
                var userToMatch = new user_1.User(queue[i].requestedBy);
                if (requestingUser.getId() === userToMatch.getId()
                    && song.id === queue[i].id
                    && song.orderInQueue === queue[i].orderInQueue) {
                    queue.splice(i, 1);
                    this.fixQueueOrder(roomId); //only fix the queue order if a song was actually removed
                    return true;
                }
            }
        }
        return false;
    };
    RoomService.prototype.handleDisconnectedUser = function (io, socket, user, roomId) {
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
    RoomService.prototype.incrementVoteCount = function (roomId, user) {
        this.setVoteCountForRoom(roomId, this.getRoomVotesToSkip(roomId) + 1);
        this.setUserHasVotedForRoom(user, roomId);
        return this.getRoomVotesToSkip(roomId);
    };
    RoomService.prototype.resetVoteCount = function (roomId) {
        this.setVoteCountForRoom(roomId, 0);
        this.resetUserHasVotedForAllUsersInRoom(roomId);
    };
    RoomService.prototype.getRoomUserCount = function (roomId) {
        return this.getRoomUsers(roomId).length;
    };
    RoomService.prototype.setVoteCountForRoom = function (roomId, newVoteCount) {
        this.roomVotesToSkipDict.put(roomId, newVoteCount);
    };
    RoomService.prototype.setUserHasVotedForRoom = function (userThatVoted, roomId) {
        var users = this.getRoomUsers(roomId);
        users.forEach(function (user, index) {
            if (userThatVoted.getId() === user.getId()) {
                users[index].setHasVotedForCurrentSong(true);
            }
        });
    };
    RoomService.prototype.resetUserHasVotedForAllUsersInRoom = function (roomId) {
        var users = this.getRoomUsers(roomId);
        users.forEach(function (user, index) {
            users[index].setHasVotedForCurrentSong(false);
        });
    };
    RoomService.prototype.getOrderInQueue = function (roomId, song) {
        var roomQueue = this.getRoomQueue(roomId);
        if (roomQueue) {
            return this.getRoomQueue(roomId).length;
        }
        else {
            return 0;
        }
    };
    RoomService.prototype.fixQueueOrder = function (roomId) {
        var queue = this.roomQueues.get(roomId);
        if (queue) {
            var i = 0;
            for (var _i = 0, queue_1 = queue; _i < queue_1.length; _i++) {
                var song = queue_1[_i];
                song.orderInQueue = i;
                i++;
            }
        }
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
