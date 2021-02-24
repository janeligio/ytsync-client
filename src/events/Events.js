const Events = {
    assign_id: 'assign id', // params: id | Server: I'm assigning you an id.
    join_room: 'join room', // params: room, id, callback | Client: I want to join a room.
    leave_room: 'leave room', // params: room, callback | Client: I want to leave a room.
    send_message: 'send message', // params: room, id, text | Client: I want to send a message.
    receive_message: 'receive message', // params: message | Server: You will receive a message.
    receive_all_messages: 'receive all messages', // params: messages[] | Server: You will receive all messages of a chatroom.
    typing: 'typing', // params: room, id | Client: I am typing
    add_to_queue: 'add to queue', // params: room, video | Client: I want to queue a video.
    player_play: 'player play', // params: room | Client: Start the video for everyone.
    player_pause: 'player pause', // params: room | Client: Pause the video for everyone.
}

export default Events;