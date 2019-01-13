export class User {
    private id: number;
    private name: string;
    private roomId: number;
    private isLeader: boolean = false;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
        this.roomId = user.roomId;
        this.isLeader = user.isLeader;
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

    public getIsLeader(): boolean {
        return this.isLeader;
    }

    public setIsLeader(isLeader: boolean): void {
        this.isLeader = isLeader;
    }

    public isValidUser(): boolean {
        if(this.id && this.name && this.roomId) {
            return true;
        } 

        return false;
    }
}