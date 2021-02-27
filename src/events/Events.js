const Events = {
    assign_id: 'assign id', // params: id | Server: I'm assigning you an id.
    create_room: 'create room', // params: room, id, callback | Client: I want to create a room.
    join_room: 'join room', // params: room, id, callback | Client: I want to join a room.
    leave_room: 'leave room', // params: room, callback | Client: I want to leave a room.
    send_message: 'send message', // params: room, id, text | Client: I want to send a message.
    receive_message: 'receive message', // params: message | Server: You will receive a message.
    receive_all_messages: 'receive all messages', // params: messages[] | Server: You will receive all messages of a chatroom.
    typing: 'typing', // params: room, id | Client: I am typing
    add_to_queue: 'add to queue', // params: room, video | Client: I want to queue a video.
    get_queue: 'get queue', // params: room, queue | Client: I want to get the room's queue
    get_current_video: 'get current video',
    player_play: 'player play', // params: room | Client: Start the video for everyone.
    player_pause: 'player pause', // params: room | Client: Pause the video for everyone.
    player_get_status: 'player get status', // params: none | Client: What is the current state of the video player?
    player_set_status: 'player set status', // params: currentTime, playerState, videoId | Client: Here is the status of the video.
    
}

export default Events;