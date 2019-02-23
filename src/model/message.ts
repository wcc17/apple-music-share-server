import { User } from './user';
import { Action } from './action';
import { Song } from './song';

export class Message {
    private from: User;
    private action: Action;
    private debugMessage: string;
    private currentQueue: Song[];

    constructor(message) {
        this.from = new User(message.from);
        this.action = message.action;
    }

    public getFromUser(): User {
        return this.from;
    }

    public setFromUser(user: User): void {
        this.from = user;
    }

    public getAction(): Action {
        return this.action;
    }

    public setAction(action: Action): void {
        this.action = action;
    }

    public getDebugMessage(): string {
        return this.debugMessage;
    }

    public setDebugMessage(debugMessage: string): void {
        this.debugMessage = debugMessage;
    }

    public getCurrentQueue(): Song[] {
        return this.currentQueue;
    }

    public setCurrentQueue(queue: Song[]): void {
        this.currentQueue = queue;
    }
}