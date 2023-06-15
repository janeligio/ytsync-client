import CallBackMessage from './CallBackMessage';
import VideoPlayerStatus from './VideoPlayerStatus';

/** Names of the events the client emits. */
export enum ClientToServerEventsTypes {
    createRoom = 'createRoom',
    joinRoom = 'joinRoom',
    leaveRoom = 'leaveRoom',
    changeName = 'changeName',
    sendMessage = 'sendMessage',
    typing = 'typing',
    addToQueue = 'addToQueue',
    removeFromQueue = 'removeFromQueue',

    play = 'play',
    pause = 'pause',
    playAt = 'playAt',
    getStatus = 'getStatus',
    loadVideo = 'loadVideo',
    setState = 'setState',
    startInterval = 'startInterval',
    stopInterval = 'stopInterval',
}

/** The ones declared in the `ClientToServerEvents` interface are used when receiving events:
 *
 * Keys are the names of the events.
 *
 * Values are the parameters that will be received from by the client by the server.
 */
export default interface ClientToServerEvents
    extends ClientToServerRoomEvents,
        ClientToServerVideoPlayerEvents {}

/** Client -> Server events related to the room.
 *
 * Keys are the names of the events.
 *
 * Values are the parameters that will be received from by the client by the server.
 */
interface ClientToServerRoomEvents {
    /** Client says: I want to create a new room
     *
     * @param clientAlias The alias of the client
     * @param callback Function is called by server as response to client for confirmation
     */
    createRoom: (
        clientAlias: string,
        callback: (message: CallBackMessage) => void
    ) => void;

    /** Client says: I want to join an existing room */
    joinRoom: (
        roomId: string,
        callback: (message: CallBackMessage) => void
    ) => void;

    /** Client says: I want to leave the room */
    leaveRoom: (
        roomId: string,
        callback: (message: CallBackMessage) => void
    ) => void;

    /** Client says: I want to change my name */
    changeName: (newName: string) => void;

    /** Client says: I want to send a message in this chat room. */
    sendMessage: (roomId: string, id: string, text: string) => void;

    /** Client says: I'm currently typing. */
    typing: (roomId: string, id: string) => void;

    /** Client says: I want to add a video to the queue. */
    addToQueue: (roomId: string, videoId: string) => void;

    /** Client says: I want to remove a video from the queue.
     *
     * @param roomId The room id
     * @param index The index of the video in the queue
     */
    removeFromQueue: (roomId: string, index: number) => void;
}

/** Client -> Server events related to YouTube video player state.
 *
 * Keys are the names of the events.
 *
 * Values are the parameters that will be received from by the client by the server.
 */
interface ClientToServerVideoPlayerEvents {
    /** Client says: I want to play/unpause the current video.
     *
     * @param roomId The room id
     */
    play: (roomId: string) => void;

    /** Client says: I want to pause the current video.
     *
     * @param roomId The room id
     * @param playerState The state of the player
     */
    pause: (roomId: string, playerState: number) => void;

    /** Client says: I want to play the current video at a specific time.
     *
     * @param roomId The room id
     * @param currentTime The time to play the video at
     */
    playAt: (roomId: string, currentTime: any) => void;

    /** Client says: I want to know the status of the video player.
     *
     * @param roomId The room
     * @param callback Function is called with the status of the video player
     */
    getStatus: (
        roomId: string,
        callback: (status: VideoPlayerStatus) => void
    ) => void;

    /** Client says: I want to play the video in the queue at the specified index.
     *
     * @param roomId The room
     * @param index The index of the video in the queue
     */
    loadVideo: (roomId: string, index: number) => void;

    /** Client says: start the timer of this room. */
    startInterval: (roomId: string) => void;

    /** Client says: stop the timer of this room. */
    stopInterval: (roomId: string) => void;

    setState: (
        room: string,
        state: { currentTime: number; playerState: VideoPlayerStatus }
    ) => void;
}
