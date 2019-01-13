import { JSDictionary } from '../util/dictionary';
import { Song } from '../model/song';
import { User } from '../model/user';
import { Rooms, Room } from 'socket.io';

const UPDATE_TIME = 10000;

export class EmitService {

    private updateTimer: any;

    private io: any;
    private roomQueues: JSDictionary<string, Song[]>;
    private roomUsers: JSDictionary<string, User[]>
    private rooms: Rooms;

    constructor(
        roomQueues: JSDictionary<string, Song[]>, 
        roomUsers: JSDictionary<string, User[]>, 
        rooms: Rooms,
        io: any
    ) {
        this.roomQueues = roomQueues;
        this.roomUsers = roomUsers;
        this.rooms = rooms;
        this.io = io;

        this.updateTimer = setInterval(() => {
            this.handleUpdateTimer();
        }, UPDATE_TIME);
    }

    private handleUpdateTimer(): void {
        // console.log('timer ' + this.timerCount + ' going off');

        this.handleUserRooms();

        // console.log('timer ' + this.timerCount + ' work is finished');
        // console.log('----------------------------------------------------');
    }

    private handleUserRooms(): void {
        for(let key of this.roomUsers.getKeys()) {
            let userRoom: User[] = this.roomUsers.get(key);
            
            let leader: User = null;
            for(let user of userRoom) {
                if(user.getIsLeader()) {
                    leader = user;
                }
            }

            //get user leaders status. Then try to make other users do what they're doing
            console.log('break');

            // this.io.sockets.in(key).emit('room-joined', message);
        }
    }
}