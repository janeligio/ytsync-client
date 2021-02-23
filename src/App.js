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
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            log('connected')
        })

        socket.on('receive message', message => {
            log('received message');
            message.timestamp = new Date(message.timestamp);
            setMessages(m => [...m, message]);
        })

        socket.on('receive all messages', allMessages => {
            console.log('received all messages');
            console.log(allMessages);
            setMessages([...allMessages]);
        })

        socket.on('assign id', id => setId(id))

        socket.on('typing', userId => {
            handleOnTyping(userId);
        })
    }, [])

    const handleOnTyping = (userId) => {
        const set = new Set([...usersTyping, userId]);
        setUsersTyping([...set]);
        setTimeout(() => {
            const newSet = new Set([...usersTyping]);
            newSet.delete(userId);
            setUsersTyping([...newSet])
        }, 1000)
    }

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
        if(!isTyping) {
            setIsTyping(true);
            socket.emit('typing', room, id);
            setTimeout(() => {
                setIsTyping(false);
            }, 1000)
        }
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
        padding: 0,
        margin: 0,
        height: 500,
        overflowY:'scroll',
    }
    const messageStyle = {
        listStyleType: 'none',
    }

    let typing = [...usersTyping] || [];
    let usersTypingEl = <li></li>;
    if(typing.length > 0) {
        if(typing.length === 1) {
            usersTypingEl = <li>User#{typing.join()} is typing...</li>;
        } else {
            usersTypingEl = <li>User#{typing.join(', ')} are typing...</li>;
        }
    }
    return (
        <div className="message-container-wrapper">
            <p style={{ margin: 0, textAlign:'right' }}>Room #{room}</p>
            <ul style={messageContainerStyle}>
                {messages.map((m, index) => {
                    const background = (index % 2 === 0) ? '#efefef' : 'white';
                    const userId = <b className="message-user-id">User#{m.userId}</b> 
                    const message = <span className="message-text">{m.message}</span>;
                    const timestamp = <small className="message-timestamp">{displayTimestamp(m.timestamp)}</small>;
                    return (
                        <li key={randomRoomNumber(10)} style={{...messageStyle, background}}>
                            <p style={{lineHeight:'1.5em', margin:0, padding:'0.5em'}}>
                                {userId} {message} {timestamp}
                            </p>
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
