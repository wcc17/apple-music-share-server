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

    public handleCreateRoom(io: any, m: any, socket: any): User {
        let debugMessage: string = '';
        let message = new Message(m);
        let isValidUser = this.userService.checkForValidUserInMessageIgnoreRoomId(message);

        if(isValidUser) {
            debugMessage = 'created room';
            
            let roomId: number = this.roomService.getNextRoomId(io);
            message.getFromUser().setIsLeader(true);
            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(debugMessage);
            
            this.roomService.addRoom(roomId.toString());
            this.roomService.addUserToRoom(socket, roomId.toString(), message.getFromUser());
    
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        } else {
            debugMessage = 'failed to create room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }

        this.logMessage(message.getFromUser(), null, debugMessage);
        return message.getFromUser();
    }
    
    public handleJoinRoom(io: any, m: any, socket: any): User {
        let debugMessage: string = '';
        let message: Message = new Message(m);
        let roomId: number = message.getFromUser().getRoomId();
    
        if(this.isValidRequest(io, roomId, message)) {
            debugMessage = 'joined room';
            
            this.roomService.addUserToRoom(socket, message.getFromUser().getRoomId().toString(), message.getFromUser());
            socket.join(message.getFromUser().getRoomId());
            
            message.setDebugMessage(debugMessage);
            this.emitMessageToRoom(io, roomId.toString(), 'room-joined', message);
        } else {
            debugMessage = 'failed to join room';
            //TODO: need to emit to a specific client, if we didn't join a room then we can't emit to the room
            // this.emitMessageToRoom(io, roomId.toString(), 'room-not-joined', message);
        }

        this.logMessage(message.getFromUser(), roomId, debugMessage);
        return message.getFromUser();
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

    public handleRemoveFromQueueRequest(io: any, m: any, song: Song): void {
        let debugMessage = '';
        let message = new Message(m);
        let roomId: number = message.getFromUser().getRoomId();

        if(this.isValidRequest(io, roomId, message)) {
            let songRemoved: boolean = this.roomService.removeSongFromQueue(roomId.toString(), song);

            if(songRemoved) {
                debugMessage = ': removed the song ' + song.attributes.name + song.attributes.artistName;
            } else {
                //TODO: should I send an error message back? Or is updating the queue enough? should i even update the queue?
                debugMessage = ': tried to remove the song ' + song.attributes.name + ' but it was not found for this user';
            }

            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomService.getRoomQueue(roomId.toString()));
            this.emitMessageToRoom(io, roomId.toString(), 'queue', message);

        } else {
            debugMessage = 'failed to remove song from queue';
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

    public handleClientUpdate(io: any, m: any, socket: any): void {
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
                    message.setDebugMessage(debugMessage);
                    this.handleLeaderClientUpdate(io, message, roomId);
                }
            } else {
                debugMessage = ' is sending up to date info to server and is being promoted to leader';
                message.setDebugMessage(debugMessage);
                this.handleUserPromotion(io, message, roomId, clientUser);
            }
        } else {
            debugMessage = 'client update request failed';

            if(clientUser && clientUser.getId() && roomId) {
                debugMessage = 'handling user that was disconnected and reconnected';
                this.roomService.handleDisconnectedUser(io, socket, clientUser, roomId);
            }
        }

        this.logMessage(clientUser, roomId, debugMessage);
    }

    public handleVoteToSkip(io: any, m: any, socket: any): void {
        let debugMessage = '';
        let message = new Message(m);
        let clientUser: User = message.getFromUser();
        let roomId = message.getFromUser().getRoomId();

        if(this.isValidRequest(io, roomId, message)) {
            let queue: Song[] = this.roomService.getRoomQueue(roomId.toString());

            if(queue.length) {
                let currentServerUser: User = this.roomService.getUserFromRoom(roomId.toString(), clientUser.getId());
                let voteCount: number = this.roomService.incrementVoteCount(roomId.toString(), currentServerUser);
                let usersInRoom: number = this.roomService.getRoomUserCount(roomId.toString());

                if(voteCount >= Math.ceil((usersInRoom / 2))) {
                    debugMessage = ' enough votes cast to skip the current song';
                    //skip the song
                    queue = this.removeMostRecentSongFromQueue(queue, roomId.toString(), message, io);
                    this.emitMessageToRoom(io, roomId.toString(), 'skip-song-for-all', message);
                } else {
                    //just send the new vote count
                    debugMessage = ' sending new vote count to all clients'
                    message.setVoteCount(this.roomService.getRoomVotesToSkip(roomId.toString()));
                    this.emitMessageToRoom(io, roomId.toString(), 'new-vote-count', message);
                }
            }
        } else {
            debugMessage = 'client vote to skip request failed';
        }

        this.logMessage(clientUser, roomId, debugMessage);
    }

    public handleClientDisconnect(io: any, userId: number, roomId: number): void {
        console.log(io.sockets.adapter.rooms);
        this.roomService.removeUserFromRoom(userId, roomId);
    }

    private handleUserPromotion(io: any, message: ClientUpdateMessage, roomId: number, clientUser: User): void {
        //if no leader is return from the room, make this user the leader and handle the client leader update
        this.roomService.promoteUserToLeaderInRoom(clientUser, roomId.toString());
        clientUser.setIsLeader(true);
        message.setFromUser(clientUser);

        this.handleLeaderClientUpdate(io, message, roomId);
    }

    private handleLeaderClientUpdate(io: any, message: ClientUpdateMessage, roomId: number) {
        let queue = this.roomService.getRoomQueue(roomId.toString());
                    
        if(message.getRemoveMostRecentSong()) {
            queue = this.removeMostRecentSongFromQueue(queue, roomId.toString(), message, io);
        }

        message.setCurrentQueue(queue);
        this.emitMessageToRoom(io, roomId.toString(), 'leader-update', message);
    }

    private removeMostRecentSongFromQueue(queue: Song[], roomId: string, message: Message, io: any): Song[] {
        queue.shift();
        this.roomService.resetVoteCount(roomId.toString());

        message.setCurrentQueue(queue);
        message.setVoteCount(0);
        this.emitMessageToRoom(io, roomId.toString(), 'new-vote-count', message); //give everyone the latest vote count
        this.emitMessageToRoom(io, roomId.toString(), 'queue', message); //give everyone the latest queue

        return queue;
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