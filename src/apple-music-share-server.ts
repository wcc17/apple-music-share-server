import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Message } from './model/message';
import { Song } from './model/song';
import { JSDictionary } from './dictionary';

export class AppleMusicShareServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;
    private roomId: number = 100000;

    private roomQueues: JSDictionary<string, Song[]> = new JSDictionary<string, Song[]>();

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || AppleMusicShareServer.PORT;
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Connected client on port %s.', this.port);

            socket.on('join-room', (m: any) => {
                this.handleJoinRoom(m, socket);
            });

            socket.on('create-room', (m: any) => {
                this.handleCreateRoom(m, socket);
            })
            
            socket.on('message', (m: any) => {
                this.handleMessage(m);
            });

            socket.on('queue', (m: any) => {
                this.handleQueue(m, m.content);
            });

            socket.on('queue-request', (m: any) => {
                this.handleQueueRequest(m);
            })

            socket.on('disconnect', () => {
                //TODO: do I need to disconnect this particular user from the room they're in?
                console.log('Client disconnected');
            });
        });
    }

    private handleCreateRoom(m: any, socket: any): void {
        let message = new Message(m);
        if(message 
            && message.getFromUser() 
            && message.getFromUser().getId() 
            && message.getFromUser().getName()) {

            let roomId: number = this.getNextRoomId();
            socket.join(roomId);

            //TODO: should I just do this before accessing the queue? Instead of relying on it being initialized here?
            this.roomQueues[roomId] = [];

            message.getFromUser().setRoomId(roomId);
            message.setDebugMessage(message.getFromUser().getName() + ' created room with id: ' + roomId);
            this.io.sockets.in(roomId.toString()).emit('room-joined', message);

            console.log('[server](message): %s', message.getDebugMessage());
        }
    }

    private handleJoinRoom(m: any, socket: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);
        let roomExists: boolean = this.checkExistingRoom(message.getFromUser().getRoomId());

        if(isValid && roomExists) {
            message.setDebugMessage(message.getFromUser().getName() + ' joined room with id: ' + message.getFromUser().getRoomId());
            
            socket.join(message.getFromUser().getRoomId());
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-joined', message);

            console.log('[server](message): %s', message.getDebugMessage());
        }

        if(!roomExists) {
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('room-not-joined', message);
        }
    }

    private handleMessage(m: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);

        if(isValid) {
            message.setDebugMessage(m.content);
            console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);
    
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('message', message);
        }

    }

    private handleQueue(m: any, song: Song): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);

        if(isValid) {
            let debugMessage: string = ': queued the song ' + song.attributes.name + ' by ' + song.attributes.artistName;
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
                
            let roomId = message.getFromUser().getRoomId();
            this.roomQueues[roomId].push(song);
            
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues[roomId]);
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    }

    private handleQueueRequest(m: any): void {
        let message = new Message(m);
        let isValid: boolean = this.checkForValidRequest(message);

        if(isValid) {
            let debugMessage: string = ': requested the current queue';
            console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
    
            let roomId = message.getFromUser().getRoomId();
            message.setDebugMessage(debugMessage);
            message.setCurrentQueue(this.roomQueues[roomId]);
            this.io.sockets.in(message.getFromUser().getRoomId().toString()).emit('queue', message);
        }
    }

    private checkForValidRequest(message: Message): boolean {
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

    private checkExistingRoom(roomId: number): boolean {
        if(this.io.sockets.adapter.rooms[roomId]) {
            return true;
        }

        return false;
    }

    //TODO: need to do this in a way that old roomIds can be re-used without restarting the whole server
    private getNextRoomId(): number {
        this.roomId++;

        while(this.checkExistingRoom(this.roomId)) {
            this.roomId++;
        }

        return this.roomId;
    }

    public getApp(): express.Application {
        return this.app;
    }
}