import { User } from './user';
import { Action } from './action';

export class Message {
    private from: User;
    private action: Action;
    private debugMessage: string;

    constructor(message) {
        this.from = new User(message.from);
        this.action = message.action;
    }

    public getFromUser(): User {
        return this.from;
    }

    public getAction(): Action {
        return this.action;
    }

    public setDebugMessage(debugMessage: string): void {
        this.debugMessage = debugMessage;
    }
}