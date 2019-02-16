import { User } from '../model/user';
import { Message } from '../model/message';

const VALIDATE_ROOM_ID = true;

export class UserService {
    constructor() { }

    public checkForValidUserInMessage(message: Message): boolean {
        if(message && message.getFromUser()) {
            return this.checkForValidUser(message.getFromUser(), VALIDATE_ROOM_ID);
        }

        return false;
    }

    public checkForValidUserInMessageIgnoreRoomId(message: Message): boolean {
        if(message && message.getFromUser()) {
            return this.checkForValidUser(message.getFromUser(), !VALIDATE_ROOM_ID);
        }
        
        return false;
    }

    private checkForValidUser(user: User, validateRoomId: boolean): boolean {
        if(validateRoomId) {
            return this.isValidUser(user);
        } else {
            return this.isValidUserIgnoreRoomId(user)
        }
    }

    private isValidUser(user: User): boolean {
        if(user.getId() && user.getName() && user.getRoomId()) {
            return true;
        } 

        return false;
    }

    private isValidUserIgnoreRoomId(user: User): boolean {
        if(user.getId() && user.getName()) {
            return true;
        } 

        return false;
    }
}