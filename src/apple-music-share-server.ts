import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import { ListenerService } from './service/listener-service';

export class AppleMusicShareServer {
    public static readonly PORT:number = 8080;
    private app: express.Application;
    private server: Server;
    private io: SocketIO.Server;
    private port: string | number;

    private listenerService: ListenerService;

    constructor() {
        this.listenerService = new ListenerService();

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
                this.listenerService.handleJoinRoom(this.io, m, socket);
            });

            socket.on('create-room', (m: any) => {
                this.listenerService.handleCreateRoom(this.io, m, socket);
            })
            
            socket.on('message', (m: any) => {
                this.listenerService.handleMessage(this.io, m);
            });

            socket.on('queue', (m: any) => {
                this.listenerService.handleQueue(this.io, m, m.content);
            });

            socket.on('queue-request', (m: any) => {
                this.listenerService.handleQueueRequest(this.io, m);
            })

            socket.on('disconnect', () => {
                //TODO: do I need to disconnect this particular user from the room they're in?
                console.log('Client disconnected');
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}