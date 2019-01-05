"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(name) {
        this.name = name;
    }
    return User;
}());
exports.User = User;
var Message = /** @class */ (function () {
    function Message(from, content) {
        this.from = from;
        this.content = content;
    }
    return Message;
}());
exports.Message = Message;
// export class ChatMessage extends Message{
//     constructor(from: User, content: string) {
//         super(from, content);
//     }
// }
