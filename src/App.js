import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import Events from './events/Events';
import YoutubePlayer from './components/YoutubePlayer';
import VideoQueue from './components/VideoQueue';
import ChatBox from './components/ChatBox';
import NameChangeModal from './components/NameChangeModal';
import Footer from './components/Footer';
import { parseURL } from './utility/utility';
// import { outline } from './utility/utility';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Alert from 'react-bootstrap/Alert';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TabContainer from 'react-bootstrap/esm/TabContainer';
import TabContent from 'react-bootstrap/TabContent';
import TabPane from 'react-bootstrap/TabPane';
import Nav from 'react-bootstrap/Nav';

const api = '/';
const { log } = console;

let socket = socketIOClient(api);

function App() {
    const [id, setId] = useState('');
    const [room, setRoom] = useState('')
    const [messages, setMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [currentView, setCurrentView] = useState('Home');
    const [alert, setAlert] = useState('');
    
    useEffect(() => {
        socket.on('connect', () => {
            log('connected')
        })

        socket.on(Events.assign_id, id => setId(id))

        socket.on(Events.receive_message, message => {
            message.timestamp = new Date(message.timestamp);
            setMessages(m => [...m, message]);
        })

        socket.on(Events.receive_all_messages, allMessages => {
            setMessages([...allMessages]);
        })
        socket.on(Events.receive_room_state, state => {
            setMessages([...state.chatHistory]);
            setQueue([...state.queue]);
            setCurrentVideo(state.currentVideo);
        })

        socket.on(Events.get_queue, queue => {
            setQueue([...queue]);
        })
        socket.on(Events.get_current_video, curr => {
            setCurrentVideo(curr);
        })

        const handleOnTyping = (userId) => {
            setUsersTyping(prevState => {
                const set = new Set([...prevState, userId]);
                return [...set];
            });
            setTimeout(() => {
                setUsersTyping(prevState => {
                    const newSet = new Set([...prevState]);
                    newSet.delete(userId);
                    return [...newSet];
                });
            }, 1000)
        }
        socket.on(Events.typing, userId => {
            handleOnTyping(userId);
        })

        socket.on(Events.add_to_queue, (room, video) => {
            setQueue(prevState => [...prevState, video]);
        })

    }, [])

    function createRoom() {
        socket.emit(Events.create_room, id, r => {
            if(r.status === 'ok') {
                setRoom(r.room);
                setCurrentView('Room');
            }
        })
    }
    function joinRoom() {
        socket.emit(Events.join_room, room, r => {
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

    function copyRoom() {
        navigator.clipboard.writeText(room);
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
            <header className="App-header"><h1>YTsync</h1></header>
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
                        <div style={{display:'flex', padding:'1em'}}>
                            <Button size="sm" variant="outline-danger" onClick={leaveRoom}>Leave Room</Button>
                            <NameChangeModal socket={socket} alias={id}/>
                        </div>

                        <Container fluid>
                            <Row style={{minHeight:'300px'}}>
                                <Col sm={12} md={8} style={{ padding:0}}>
                                    <YoutubePlayer
                                    queue={queue}
                                    setQueue={setQueue}
                                    currentVideo={currentVideo}
                                    setCurrentVideo={setCurrentVideo}
                                    socket={socket}
                                    room={room}
                                    />
                                </Col>
                                <Col sm={12} md={4}>
                                    <div style={{ display: 'flex', marginTop:'1em' }}>
                                        <p onClick={copyRoom} className="room-text">Room: {` `}
                                            <span className="room-number">#{room}</span></p>
                                        <p className="room-text">Name: {id} </p>
                                    </div>
                                    <TabContainer defaultActiveKey="chat">
                                        <Nav style={{marginBottom:1}}>
                                            <Nav.Item className="tab-link-parent">
                                                <Nav.Link className="tab-link" eventKey="chat">Chat</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item className="tab-link-parent">
                                                <Nav.Link className="tab-link" eventKey="queue">Queue</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        <TabContent>
 
                                            <TabPane eventKey="chat">                                                
                                                <ChatBox
                                                    room={room}
                                                    messages={messages}
                                                    sendMessage={sendMessage}
                                                    emitUserTyping={emitUserTyping}
                                                    usersTyping={usersTyping} />
                                            </TabPane>

                                            <TabPane eventKey="queue">
                                                <VideoQueue queue={queue} addToQueue={addToQueue} currentVideo={currentVideo} />
                                            </TabPane>
                                        </TabContent>
                                    </TabContainer>
                                </Col>
                            </Row>
                        </Container>


                    </Room>}
            </main>
            <Footer/>
        </div>
    )
}

function Home(props) {
    const { setRoom, joinRoom, createRoom, alert, setAlert } = props;
    return (
        <Container className="home-parent" fluid>
            <div className="home-child">
                <Button className="home" onClick={createRoom} block>Create Room</Button>
                <p className="home">Or</p>
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                    <Button className="home" onClick={joinRoom} block>Join Room</Button> 
                    </InputGroup.Prepend>
                    <FormControl
                        onChange={e => setRoom(e.target.value)} 
                        placeholder="Room #"
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        />                
                </InputGroup>
                { alert && <AlertMessage alert={alert} setAlert={setAlert}/> }
            </div>
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
