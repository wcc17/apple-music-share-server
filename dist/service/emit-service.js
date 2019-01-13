"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UPDATE_TIME = 10000;
var EmitService = /** @class */ (function () {
    function EmitService(roomQueues, roomUsers, rooms, io) {
        var _this = this;
        this.roomQueues = roomQueues;
        this.roomUsers = roomUsers;
        this.rooms = rooms;
        this.io = io;
        this.updateTimer = setInterval(function () {
            _this.handleUpdateTimer();
        }, UPDATE_TIME);
    }
    EmitService.prototype.handleUpdateTimer = function () {
        // console.log('timer ' + this.timerCount + ' going off');
        this.handleUserRooms();
        // console.log('timer ' + this.timerCount + ' work is finished');
        // console.log('----------------------------------------------------');
    };
    EmitService.prototype.handleUserRooms = function () {
        for (var _i = 0, _a = this.roomUsers.getKeys(); _i < _a.length; _i++) {
            var key = _a[_i];
            var userRoom = this.roomUsers.get(key);
            var leader = null;
            for (var _b = 0, userRoom_1 = userRoom; _b < userRoom_1.length; _b++) {
                var user = userRoom_1[_b];
                if (user.getIsLeader()) {
                    leader = user;
                }
            }
            //get user leaders status. Then try to make other users do what they're doing
            console.log('break');
            // this.io.sockets.in(key).emit('room-joined', message);
        }
    };
    return EmitService;
}());
exports.EmitService = EmitService;
