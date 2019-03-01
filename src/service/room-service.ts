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

    public addSongToQueue(roomId: string, song: Song) {
        song.orderInQueue = this.getOrderInQueue(roomId, song);
        this.addObjectToQueue(roomId, song, this.roomQueues);
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

    public removeSongFromQueue(roomId: string, song: Song): boolean {
        if(this.roomQueues.get(roomId)) {
            let queue: Song[] = this.roomQueues.get(roomId);
            let requestingUser: User = new User(song.requestedBy);

            var i = queue.length;
            while(i--) {
                let userToMatch: User = new User(queue[i].requestedBy);

                if(requestingUser.getId() === userToMatch.getId()
                    && song.id === queue[i].id
                    && song.orderInQueue === queue[i].orderInQueue) {
                    queue.splice(i, 1);
                    return true;
                }
            }
        }

        return false;
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

    private getOrderInQueue(roomId: string, song: Song): number {
        /**
         * orderInQueue is more of an ID that just makes sure we're removing the song we think we're removing
         * if the user tries to delete it. We're not changing the order of the array at any point, so even when
         * songs are removed and certain "orderInQueue" values don't exist anymore, the songs will still play in 
         * the order that the UI expects them (and shows them)
         */
        let roomQueue = this.getRoomQueue(roomId);
        if(roomQueue) {
            return this.getRoomQueue(roomId).length;
        } else {
            return 0;
        }
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
