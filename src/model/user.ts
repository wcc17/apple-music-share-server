export class User {
    private id: number;
    private name: string;
    private roomId: number;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.roomId = user.roomId;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getRoomId(): number {
        return this.roomId;
    }

    public setRoomId(roomId: number): void {
        this.roomId = roomId;
    }

    public isValidUser(): boolean {
        if(this.id && this.name && this.roomId) {
            return true;
        } 

        return false;
    }
}