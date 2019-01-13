import { Message } from '../model/message';
import { Song } from '../model/song';
import { User } from '../model/user';
import { JSDictionary } from '../util/dictionary';

export class ListenerService {

    private roomQueues: JSDictionary<string, Song[]>;
    private roomUsers: JSDictionary<string, User[]>;
    private roomId: number;

    constructor() {
        this.roomQueues = new JSDictionary<string, Song[]>();
        this.roomUsers = new JSDictionary<string, User[]>();
        this.roomId = 100000;
    }

    public handleCreateRoom(io: any, m: any, socket: any): void {
        let message = new Message(m);
        if(message 
            && message.getFromUser() 
            && message.getFromUser().getId() 
            && message.getFromUser().getName()) {
    
            let roomId: number = this.getNextRoomId(io.sockets.adapter.rooms);
            socket.join(roomId);

            message.getFromUser().setIsLeader(true);
    
            this.roomQueues.put(roomId.toString(), []);
            this.roomUsers.put(roomId.toString(), [message.getFromUser()]);
    
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(message.getFromUser().getName() + ' created room with id: ' + roomId);
            io.sockets.in(roomId.toString()).emit('room-joined', message);
    
            console.log('[server](message): %s', message.getDebugMessage());
        }
    }
    
    public handleJoinRoom(io: any, m: any, socket: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
        let roomExists: boolean = this.checkExistingRoom(io.sockets.adapter.rooms, message.getFromUser().getRoomId());
    
        if(isValid && roomExists) {
            message.setDebugMessage(message.getFromUser().getName() + ' joined room with id: ' + message.getFromUser().getRoomId());
            
            socket.join(message.getFromUser().getRoomId());
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-joined', message);

            this.addUserToRoom(message.getFromUser().getRoomId().toString(), message.getFromUser());
    
            console.log('[server](message): %s', message.getDebugMessage());
        }
    
        if(!roomExists) {
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-not-joined', message);
        }
    }
    
    public handleMessage(io: any, m: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
    
        if(isValid) {
            message.setDebugMessage(m.content);
            console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);
    
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('message', message);
        }
    
    }
    
    public handleQueue(io: any, m: any, song: Song): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
    
        if(isValid) {
            let debugMessage: string = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
                
            let roomId = message.getFromUser().getRoomId();
            this.addSongToQueue(roomId.toString(), song);
            
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues.get(roomId.toString()));
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    }
    
    public handleQueueRequest(io: any, m: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
    
        if(isValid) {
            let debugMessage: string = ': requested the current queue';
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
    
            let roomId = message.getFromUser().getRoomId();
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues.get(roomId.toString()));
            io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    }

    public handleUpdateUser(io: any, m: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
        let roomId = message.getFromUser().getRoomId();

        if(isValid && roomId) {
            let debugMessage: string = ' is sending up to date info';
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);

            let users: User[] = this.roomUsers.get(roomId.toString());
            if(users && users.length) {
                for(let user of users) {
                    if(user.getId() === message.getFromUser().getId()) {
                        //update playback state here.
                        console.log(user.getId() + ' with name ' + user.getName() + ' is being updated');
                        break;
                    }
                }
            }
        }
    }
    
    public checkForValidRequest(message: Message): boolean {
        if(message
            && message.getFromUser()
            && message.getFromUser().isValidUser()) {
            return true;
        }
    
        if(message.getFromUser() && message.getFromUser().getName()) {
            console.log('User ' + message.getFromUser().getName() + ' made a request with missing info');
        } else {
            console.log('User made a request with missing info');
        }
        return false;
    }

    public getRoomQueues(): JSDictionary<string, Song[]> {
        return this.roomQueues;
    }

    public getRoomUsers(): JSDictionary<string, User[]> {
        return this.roomUsers;
    }
    
    private checkExistingRoom(rooms: any[], roomId: number): boolean {
        if(rooms[roomId]) {
            return true;
        }
    
        return false;
    }
    
    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    private getNextRoomId(rooms: any[]): number {
        this.roomId++;
    
        while(this.checkExistingRoom(rooms, this.roomId)) {
            this.roomId++;
        }
    
        return this.roomId;
    }

    private addSongToQueue(key: string, song: Song) {
        this.addObjectToQueue(key, song, this.roomQueues);
    }

    private addUserToRoom(key: string, user: User) {
        this.addObjectToQueue(key, user, this.roomUsers);
    }

    private addObjectToQueue(key: string, obj: any, queue: JSDictionary<string, any[]>): void {
        if(queue.get(key)) {
            let arr: any[] = queue[key];

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
}