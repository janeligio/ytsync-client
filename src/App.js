import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import Events from './events/Events';
import YoutubePlayer from './components/YoutubePlayer';
import ChatBox from './components/ChatBox';
import { parseURL, outline } from './utility/utility';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const api = '/';
const { log } = console;

let socket = socketIOClient(api);

function App() {
    const [id, setId] = useState('');
    const [room, setRoom] = useState('')
    const [messages, setMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [queue, setQueue] = useState(['utdDBdYEasc']);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [currentView, setCurrentView] = useState('Home');
    const [alert, setAlert] = useState('');
    
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

    function createRoom() {
        socket.emit(Events.create_room, id, r => {
            if(r.status === 'ok') {
                setRoom(r.room);
                setCurrentView('Room');
            }
        })
    }
    function joinRoom() {
        socket.emit(Events.join_room, room, id, r => {
            if (r.status === 'ok') {
                setRoom(r.room);
                setCurrentView('Room');
            } else {
                setAlert(r.errors);
                setRoom('');
            }
        })
    }

    function leaveRoom() {
        socket.emit(Events.leave_room, room, r => {
            if(r.status === 'ok') {
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
            <header className="App-header">YTsync</header>
            <main>
                {currentView === 'Home' && 
                    <Home 
                        room={room} 
                        setRoom={setRoom} 
                        joinRoom={joinRoom} 
                        createRoom={createRoom} 
                        alert={alert}
                        setAlert={setAlert}/>}
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
    const { room, setRoom, joinRoom, createRoom, alert, setAlert } = props;
    return (
        <Container style={{...outline, padding:'1em'}}>
                <Button className="home" onClick={createRoom} block>Create Room</Button>
                <p className="home">Or</p>
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                    <Button className="home" onClick={joinRoom} block>Join Room</Button> 
                    </InputGroup.Prepend>
                    <FormControl
                        onChange={e => setRoom(e.target.value)} 
                        placeholder="Room#"
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        />                
                </InputGroup>
                { alert && <AlertMessage alert={alert} setAlert={setAlert}/> }
        </Container>
    );
}

function Room(props) {
    return (props.children);
}

function AlertMessage(props) {
    const [show, setShow] = useState(true);
    const { alert, setAlert } = props;
    if(show) {
        return (<Alert variant="danger" onClose={() => {
            setShow(false);
            setAlert('');
        }} dismissible>{alert}</Alert>);
    }
    return null;
}
export default App;
