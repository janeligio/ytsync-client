export enum MessageType {
    Chat = 'Chat',
    Welcome = 'Welcome',
    Fairwell = 'Fairwell',
}

export default class Message {
    room: string;
    userId: string;
    message: string;
    timestamp: Date;
    messageType: MessageType;

    constructor(
        room: string,
        userId: string,
        message: string,
        messageType: MessageType
    ) {
        this.room = room;
        this.userId = userId;
        this.message = message;
        this.timestamp = new Date();
        this.messageType = messageType;
    }
}
