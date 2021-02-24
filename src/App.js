import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import Events from './events/Events';
import YoutubePlayer from './components/YoutubePlayer';
import ChatBox from './components/ChatBox';
import { parseURL, randomRoomNumber} from './utility/utility';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const api = '/';
const { log } = console;

let socket = socketIOClient(api);

function App() {
    const [id, setId] = useState('');
    const [room, setRoom] = useState(`${randomRoomNumber(4)}`)
    const [joinedRoom, setJoinedRoom] = useState(false);
    const [messages, setMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [queue, setQueue] = useState(['utdDBdYEasc']);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [currentView, setCurrentView] = useState('Home');

    useEffect(() => {
        socket.on('connect', () => {
            log('connected')
        })

        socket.on(Events.receive_message, message => {
            message.timestamp = new Date(message.timestamp);
            setMessages(m => [...m, message]);
        })

        socket.on(Events.receive_all_messages, allMessages => {
            setMessages([...allMessages]);
        })

        socket.on(Events.assign_id, id => setId(id))

        socket.on(Events.typing, userId => {
            handleOnTyping(userId);
        })

        socket.on(Events.add_to_queue, (room, video) => {
            setQueue(prevState => [...prevState, video]);
        })

    }, [])

    function handleOnTyping(userId) {
        const set = new Set([...usersTyping, userId]);
        setUsersTyping([...set]);
        setTimeout(() => {
            const newSet = new Set([...usersTyping]);
            newSet.delete(userId);
            setUsersTyping([...newSet])
        }, 1000)
    }

    function joinRoom() {
        socket.emit(Events.join_room, room, id, r => {
            if (r.status === 'ok') {
                setJoinedRoom(true);
                setRoom(r.room);
                setCurrentView('Room');
            }
        })
    }

    function leaveRoom() {
        socket.emit(Events.leave_room, room, r => {
            if(r.status === 'ok') {
                setJoinedRoom(false);
                setRoom('');
                setCurrentView('Home');
            }
        })
    }

    function sendMessage(text) {
        socket.emit(Events.send_message, room, id, text);
    }

    function emitUserTyping() {
        if(!isTyping) {
            setIsTyping(true);
            socket.emit(Events.typing, room, id);
            setTimeout(() => {
                setIsTyping(false);
            }, 1000)
        }
    }

    function addToQueue(video) {
        const videoId = parseURL(video);
        if(videoId.length > 0) {
            socket.emit(Events.add_to_queue, room, videoId);
        } else {
            // Error
        }
    }

    return (
        <div className="App">
            <header>YTsync</header>
            <main>
                {currentView === 'Home' && 
                    <Home room={room} setRoom={setRoom} joinRoom={joinRoom}/>}
                {currentView === 'Room' && 
                    <Room>
                        <button onClick={leaveRoom}>Leave Room</button>
                        <YoutubePlayer 
                            queue={queue}
                            addToQueue={addToQueue}
                            currentVideo={currentVideo}
                            socket={socket}
                            room={room}
                            />
                        <ChatBox 
                            room={room} 
                            messages={messages} 
                            sendMessage={sendMessage} 
                            emitUserTyping={emitUserTyping} 
                            usersTyping={usersTyping}/>
                    </Room>}
            </main>
        </div>
    )
}

function Home(props) {
    const { room, setRoom, joinRoom } = props;
    return (
        <div>
            <input value={room} onChange={e => setRoom(e.target.value)} />
            <button onClick={joinRoom}>Join Room</button>
        </div>
    );
}

function Room(props) {
    return (props.children);
}
export default App;
