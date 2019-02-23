import { JSDictionary } from '../util/dictionary';
import { Song } from '../model/song';
import { User } from '../model/user';

export class RoomService {
    private roomQueues: JSDictionary<string, Song[]>;
    private roomUsers: JSDictionary<string, User[]>;
    private roomId: number;

    constructor() {
        this.roomQueues = new JSDictionary<string, Song[]>();
        this.roomUsers = new JSDictionary<string, User[]>();
        this.roomId = 100000;
    }

    public addRoom(roomId: string): void {
        this.roomQueues.put(roomId.toString(), []);
    }

    public addSongToQueue(key: string, song: Song) {
        this.addObjectToQueue(key, song, this.roomQueues);
    }

    public addUserToRoom(socket: any, roomId: string, user: User) {
        socket.join(roomId);
        this.addObjectToQueue(roomId, user, this.roomUsers);
    }

    public getRoomQueue(roomId: string): Song[] {
        return this.roomQueues.get(roomId.toString());
    }

    public setRoomQueue(roomId: string, queue: Song[]): void {
        this.roomQueues.put(roomId.toString(), queue);
    }

    public getRoomUsers(roomId: string): User[] {
        let users: User[] = this.roomUsers.get(roomId.toString());
        if(users) {
            return users;
        } else {
            return [];
        }
    }

    public getUserFromRoom(roomId: string, userId: number): User {
        let users: User[] = this.getRoomUsers(roomId);
        for(let user of users) {
            if(user.getId() === userId) {
                return user;
            }
        }

        return null;
    }

    public getLeaderFromRoom(roomId: string): User {
        let users: User[] = this.getRoomUsers(roomId);
        for(let user of users) {
            if(user.getIsLeader()) {
                return user;
            }
        }

        return null;
    }

    public promoteUserToLeaderInRoom(newLeaderUser: User, roomId: string): void {
        let users: User[] = this.getRoomUsers(roomId);
        users.forEach((user, index) => {
            if(newLeaderUser.getId() === user.getId()) {
                users[index].setIsLeader(true);
            }
        });
    }

    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    //TODO: this is stupid right
    public getNextRoomId(io: any): number {
        this.roomId++;
        while(this.checkExistingRoom(io, this.roomId)) {
            this.roomId++;
        }
    
        return this.roomId;
    }

    public checkExistingRoom(io: any, roomId: number): boolean {
        let rooms: any[] = this.getSocketRooms(io);

        if(roomId && rooms[roomId]) {
            return true;
        }
    
        return false;
    }

    public removeUserFromRoom(userId: number, roomId: number): void {
        let users: User[] = this.getRoomUsers(roomId.toString());

        var i = users.length;
        while(i--) {
            if(users[i].getId() === userId) {
                users.splice(i, 1);
                break;
            }
        }
    }

    public handleDisconnectedUser(io: any, socket: any, user: User, roomId: number): User {
        //there is a chance here that the client will still be sending updates, but will have been disconnected
        //if the client is sending a user id and a room id:
            //check if the room exists. If so, join the room
            //if the room does not exist, create the room, make the user the leader and move on. Make sure to keep the client's copy of the queue if possible
        let roomExists: boolean = this.checkExistingRoom(io, roomId);
        if(roomExists) {
            user.setIsLeader(false);
        } else {
            user.setIsLeader(true);
            this.addRoom(roomId.toString());
        }

        this.addUserToRoom(socket, roomId.toString(), user);
        return user;
    }

    private addObjectToQueue(key: string, obj: any, queue: JSDictionary<string, any[]>): void {
        if(queue.get(key)) {
            let arr: any[] = queue.get(key);

            if(arr) {
                arr.push(obj);
            } else {
                arr = [obj];
            }

            queue.put(key, arr);
        } else {
            queue.put(key, [ obj ]);
        }
    }

    private getSocketRooms(io: any): any {
        return io.sockets.adapter.rooms;
    }
}
