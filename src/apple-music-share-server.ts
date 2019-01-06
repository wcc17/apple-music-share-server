import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';

import { Message } from './model/message';
import { Action } from './model/action';
import { Song } from './model/song';

export class AppleMusicShareServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;

    private queue: Song[] = [];

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
                console.log('Client disconnected');
            });
        });
    }

    private handleMessage(m: any): void {
        let message = new Message(m);

        message.setDebugMessage(m.content);
        console.log('[server](message): %s', message.getFromUser().getName() + ': ' + m.content);

        this.io.emit('message', message);
    }

    private handleQueue(m: any, song: Song): void {
        let message = new Message(m);

        let debugMessage: string = ': queued the song ' 
            + song.attributes.name 
            + ' by ' + song.attributes.artistName;
        console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);
            
        this.queue.push(song);
        
        message.setDebugMessage(debugMessage);
        message.setCurrentQueue(this.queue);
        this.io.emit('queue', message);
    }

    private handleQueueRequest(m: any): void {
        let message = new Message(m);

        let debugMessage: string = ': requested the current queue';
        console.log('[server](message): %s', message.getFromUser().getName() + debugMessage);

        message.setAction(Action.QUEUE);
        message.setDebugMessage(debugMessage);
        message.setCurrentQueue(this.queue);
        this.io.emit('queue', message);
    }

    public getApp(): express.Application {
        return this.app;
    }
}