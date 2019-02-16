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

    public addUserToRoom(key: string, user: User) {
        this.addObjectToQueue(key, user, this.roomUsers);
    }

    public getRoomQueue(roomId: string): Song[] {
        return this.roomQueues.get(roomId.toString());
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

        //TODO: if for some reason the user left, we should make another user the leader
        return null;
    }

    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    //TODO: this is stupid right
    public getNextRoomId(io: any): number {
        let rooms: any[] = this.getSocketRooms(io);

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
