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
                let newMessage = new Message(m);

                switch(newMessage.getAction()) {
                    case Action.QUEUE:
                        let song: Song = m.content;
                        //TODO: do something with the song
                        let debugMessage: string = ': queued the song ' 
                            + song.attributes.name 
                            + ' by ' + song.attributes.artistName;
                        newMessage.setDebugMessage(debugMessage);
                        console.log('[server](message): %s', newMessage.getFromUser().getName() + debugMessage);
                        break;
                    default:
                        let message: string = m.content;
                        console.log('[server](message): %s', newMessage.getFromUser().getName() + ': ' + message);
                        newMessage.setDebugMessage(message);
                        break;
                }

                this.io.emit('message', newMessage);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}