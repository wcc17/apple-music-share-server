import { Message } from '../model/message';
import { Song } from '../model/song';
import { User } from '../model/user';
import { ClientUpdateMessage } from '../model/client-update-message';
import { RoomService } from './room-service';
import { UserService } from './user-service';
import { debug } from 'util';

export class ListenerService {

    private roomService: RoomService;
    private userService: UserService;

   constructor() {
       this.roomService = new RoomService();
       this.userService = new UserService();
   }

    public handleCreateRoom(io: any, m: any, socket: any): void {
        let debugMessage: string = '';
        let message = new Message(m);
        let isValidUser = this.userService.checkForValidUserInMessageIgnoreRoomId(message);

        if(isValidUser) {
            debugMessage = 'created room';
            
            let roomId: number = this.roomService.getNextRoomId(io);
            message.getFromUser().setIsLeader(true);
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(debugMessage);
            
            socket.join(roomId);
            this.roomService.addRoom(roomId.toString());
            this.roomService.addUserToRoom(roomId.toString(), message.getFromUser());
    
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        } else {
            debugMessage = 'failed to create room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }

        this.logMessage(message.getFromUser(), null, debugMessage);
    }
    
    public handleJoinRoom(io: any, m: any, socket: any): void {
        let debugMessage: string = '';
        let message: Message = new Message(m);
        let roomId: number = message.getFromUser().getRoomId();
    
        if(this.isValidRequest(io, roomId, message)) {
            debugMessage = 'joined room';
            
            this.roomService.addUserToRoom(message.getFromUser().getRoomId().toString(), message.getFromUser());
            socket.join(message.getFromUser().getRoomId());
            
            message.setDebugMessage(debugMessage);
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        } else {
            debugMessage = 'failed to join room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }

        this.logMessage(message.getFromUser(), roomId, debugMessage);
    }
    
    public handleMessage(io: any, m: any): void {
        let debugMessage: string = '';
        let message = new Message(m);
        let roomId = message.getFromUser().getRoomId();
    
        if(this.isValidRequest(io, roomId, message)) {
            debugMessage = m.content;
            
            message.setDebugMessage(debugMessage);
            this.emitMessageToRoom(io, roomId.toString(), 'message', message);
        } else {
            debugMessage = 'failed to process message';
        }

        this.logMessage(message.getFromUser(), roomId, debugMessage);
    }
    
    public handleQueue(io: any, m: any, song: Song): void {
        let debugMessage: string = '';
        let message = new Message(m);
        let roomId: number = message.getFromUser().getRoomId();

        if(this.isValidRequest(io, roomId, message)) {
            this.roomService.addSongToQueue(roomId.toString(), song);

            debugMessage = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomService.getRoomQueue(roomId.toString()));
            
            this.emitMessageToRoom(io, roomId.toString(), 'queue', message);
        } else {
            debugMessage = 'failed to queue song';
        }

        this.logMessage(message.getFromUser(), roomId, debugMessage);
    }
    
    public handleQueueRequest(io: any, m: any): void {
        let debugMessage = '';
        let message = new Message(m);
        let roomId = message.getFromUser().getRoomId();
        let userId = message.getFromUser().getId();
        let userName = message.getFromUser().getName();

        if(this.isValidRequest(io, roomId, message)) {
            debugMessage = 'requested the current queue';
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomService.getRoomQueue(roomId.toString()));

            this.emitMessageToRoom(io, roomId.toString(), 'queue', message);
        } else {
            debugMessage = 'queue request failed';
        }

        this.logMessage(message.getFromUser(), roomId, debugMessage);
    }

    public handleClientUpdate(io: any, m: any): void {
        let debugMessage = '';
        let message = new ClientUpdateMessage(m);
        let clientUser: User = message.getFromUser();
        let roomId = message.getFromUser().getRoomId();

        if(this.isValidRequest(io, roomId, message)) {
            debugMessage = 'is sending up to date info to server';

            let currentServerUser = this.roomService.getUserFromRoom(roomId.toString(), clientUser.getId());
            let leaderServerUser = this.roomService.getLeaderFromRoom(roomId.toString());
            if(leaderServerUser) {
                if(currentServerUser.getId() === leaderServerUser.getId()) {
                    let queue = this.roomService.getRoomQueue(roomId.toString());
                    
                    if(message.getRemoveMostRecentSong()) {
                        queue.shift();
                        this.emitMessageToRoom(io, roomId.toString(), 'queue', message); //give everyone the latest queue
                    }

                    message.setCurrentQueue(queue);
                    message.setDebugMessage(debugMessage);
                    this.emitMessageToRoom(io, roomId.toString(), 'leader-update', message);
                }
            }
        } else {
            debugMessage = 'client update request failed';
        }

        this.logMessage(clientUser, roomId, debugMessage);
    }

    private isValidRequest(io: any, roomId: number, message: Message): boolean {
        let isValidUser: boolean = this.userService.checkForValidUserInMessage(message);
        let isValidRoom = this.roomService.checkExistingRoom(io, roomId);

        return (isValidUser && isValidRoom);
    }

    private emitMessageToRoom(io: any, roomId: string, event: string, message: Message): void {
        io.sockets.in(roomId).emit(event, message);
    }

    private logMessage(user: User, roomId: number, message: string) {
        let userId: string = (user && user.getId()) ? user.getId().toString() : 'not provided';
        let userName: string = (user && user.getName()) ? user.getName() : 'not provided';
        let isLeader: string = (user && user.getIsLeader()) ? "Yes" : "No";
        let roomIdString: string = (roomId) ? roomId.toString() : 'not provided';
        let messageString: string = (message) ? message : 'not provided';

        console.log('[%s][userId: %s][userName: %s][isLeader: %s][roomId: %s][message: %s]', 
            new Date().toUTCString(), userId, userName, isLeader, roomIdString, messageString);
    }
}