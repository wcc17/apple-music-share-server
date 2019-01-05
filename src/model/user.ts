export class User {
    private id: string;
    private name: string;

    constructor(user) {
        this.id = user.id;
        this.name = user.name;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }
}