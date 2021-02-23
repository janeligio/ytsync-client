import { useEffect, useState } from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';
const api = '/';


const { log, dir } = console;

let socket = socketIOClient(api);

function App() {
    const [id, setId] = useState('');
    const [room, setRoom] = useState(`${randomRoomNumber(4)}`)
    const [joinedRoom, setJoinedRoom] = useState(false);
    const [messages, setMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            log('connected')
        })

        socket.on('receive message', message => {
            log('received message');
            log(message);
            message.timestamp = new Date(message.timestamp);
            setMessages([...messages, message]);
        })

        socket.on('receive all messages', allMessages => {
            console.log('received all messages');
            console.log(allMessages);
            setMessages([...allMessages]);
        })

        socket.on('assign id', id => setId(id))

        // socket.on('typing', userId => {
        //     if (usersTyping.indexOf(userId) < 0) {
        //         log('user typing')
        //         log(usersTyping)
        //         setUsersTyping([...usersTyping, userId]);
        //         setTimeout(() => {
        //             setUsersTyping([...usersTyping.filter(user => user !== userId)])
        //             log('user done typing')
        //         }, 2000)
        //     }
        // })
    }, [setMessages, messages, setUsersTyping, usersTyping])

    function joinRoom() {
        socket.emit('join room', room, id, r => {
            if (r.status === 'ok') {
                setJoinedRoom(true);
                setRoom(r.room);
            }
        })
    }

    function sendMessage(text) {
        socket.emit('send message', room, id, text);
    }

    function emitUserTyping() {
        socket.emit('typing', room, id);
    }

    return (
        <div className="App">
            <header>Socket IO Client</header>
            <main>
                <input value={room} onChange={e => setRoom(e.target.value)} />
                <button onClick={joinRoom}>Join Room</button>
                {
                    !joinedRoom ? null : <ChatBox room={room} messages={messages} sendMessage={sendMessage} emitUserTyping={emitUserTyping} usersTyping={usersTyping}/>
                }
            </main>
        </div>
    )
}

function ChatBox({ room, messages, sendMessage, emitUserTyping, usersTyping }) {
    const [text, setText] = useState('');

    const style = {
        border: '1px solid black',
        width: 500,
        overflow: 'hidden'
    }
    const messageContainerStyle = {
        border: '1px solid black',
        padding: 0,
        margin: 0
    }
    const messageStyle = {
        listStyleType: 'none',
        borderBottom: '1px solid black'
    }

    let typing = usersTyping || [];
    let usersTypingEl = <li></li>;
    if(typing.length > 0) {
        if(typing.length === 1) {
            usersTypingEl = <li>User#{typing.join()} is typing...</li>;
        } else {
            usersTypingEl = <li>User#{typing.join(', ')} are typing...</li>;
        }
    }
    return (
        <div style={style}>
            <p style={{ margin: 0 }}>Room #{room}</p>
            <ul style={messageContainerStyle}>
                {messages.map(m => {
                    return (<li key={randomRoomNumber(10)} style={messageStyle}>
                        <b>User#{m.userId}</b> <p style={{ display: 'inline' }}>{m.message}</p> <small>{displayTimestamp(m.timestamp)}</small>
                    </li>)
                })}
                { usersTypingEl }
            </ul>
            <span>
                <input style={{ width: '88%' }} value={text} onChange={e => {
                    setText(e.target.value);
                    emitUserTyping();
                }} />
                <button style={{ width: '10%' }} onClick={e => { sendMessage(text); setText('') }}>Send</button>
            </span>
        </div>
    );
}

function displayTimestamp(timestamp) {
    const timeObj = new Date(timestamp);
    let hours = timeObj.getHours();
    const minutes = timeObj.getMinutes();
    let period = 'am';
    if (hours >= 12) {
        hours -= 12;
        period = 'pm';
    } else if (hours === 0) {
        hours = 12;
    }
    return `${hours}:${minutes}${period}`
}
function randomRoomNumber(length) {
    let id = '';
    for (let i = 0; i < length; i++) {
        id += Math.floor(Math.random() * Math.floor(10))
    }
    return id;
}

export default App;
