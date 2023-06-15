export enum Status {
    SUCCESS,
    FAILURE,
    ERROR,
}

export default interface CallBackMessage {
    status: Status;
    room?: string;
    error?: string;
}
