import Message from './Message';

/** Names of the events the server emits. */
export enum ServerToClientEventsTypes {
    assignAlias = 'assignAlias',
    receiveRoomState = 'receiveRoomState',
    typing = 'typing',
    addToQueue = 'addToQueue',
    removeFromQueue = 'removeFromQueue',
    receiveMessage = 'receiveMessage',
    setCurrentVideo = 'setCurrentVideo',
    playVideo = 'playVideo',
    playVideoAt = 'playVideoAt',
    pauseVideo = 'pauseVideo',
    loadVideo = 'loadVideo',
    getCurrentVideo = 'getCurrentVideo',
}

/** The events declared in the `ServerToClientEvents` interface are used when sending and broadcasting events:
 *
 * https://socket.io/docs/v4/typescript/
 */
export default interface ServerToClientEvents
    extends ServerToClientRoomEvents,
        ServerToClientVideoPLayerEvents {}

interface ServerToClientRoomEvents {
    /** Server says here is your name I assigned:
     *
     * @param alias - the alias of the client
     */
    assignAlias: (alias: string) => void;

    /** Server says: here is the state of the room:
     *
     * - chatHistory: the chat history
     * - queue: the queue
     * - currentVideo: the current video
     */
    receiveRoomState: (roomState: {
        chatHistory: Message[];
        queue: string[];
        currentVideo: number;
    }) => void;

    /** Server says: someone's typing
     *
     * @param id the id of the person typing
     */
    typing: (id: string) => void;

    /** Server says: Someone wants add a video to the queue.
     *
     * @param roomId - the room
     * @param videoId the id of the video to add
     */
    addToQueue: (roomId: string, videoId: string) => void;

    /** Server says: Someone wants to remove a video from the queue.
     *
     * @param queue - The new queue with the video removed
     */
    removeFromQueue: (queue: string[]) => void;

    /** Server says: Someone wants to send a message to the room. */
    receiveMessage: (message: Message) => void;

    /** Server says: Someone changed the current video this index in the queue */
    getCurrentVideo: (index: number) => void;
}

interface ServerToClientVideoPLayerEvents {
    /** Server says: Someone wants to set the current video.
     *
     * @param videoIndex - The index of the video in the queue
     */
    setCurrentVideo: (videoIndex: number) => void;

    /** Server says: Someone wants to play the current video. */
    playVideo: (playerState: number) => void;

    /** Server says: Someone wants to seek the current video. */
    playVideoAt: (playerData: {
        currentTime: number;
        playerState: number;
    }) => void;

    /** Server says: Someone wants to pause the current video. */
    pauseVideo: (playerData: {
        currentTime: number;
        playerState: number;
    }) => void;

    /** Server says: Someone wants to load the video at the specified index in to the video player. */
    loadVideo: (videoIndex: number) => void;
}
