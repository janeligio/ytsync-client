import { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';
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

const { log } = console;

let socket = socketIOClient(process.env.REACT_APP_SERVER_API);

function App() {
    const [id, setId] = useState('');
    const [room, setRoom] = useState('')
    const [messages, setMessages] = useState([]);
    const [usersTyping, setUsersTyping] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [queue, setQueue] = useState([]);
    const [queueData, setQueueData] = useState([]);
    const [videoPlayer, setVideoPlayer] = useState(undefined);
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

        const fetchVideoData = (videoId) => {
            const endpoint = `${process.env.REACT_APP_SERVER_API}/video/${videoId}`;
            return axios({
                method:'get',
                url:endpoint
            });
        };
        
        const requestAll = (videoIds) =>  {
            let queueDataPromises = [];
            videoIds.forEach(videoId => {
                queueDataPromises.push(fetchVideoData(videoId));
            })
            Promise.all(queueDataPromises).then(responses => {
                let data = [];
                responses.forEach(response => {
                    let queueDatum = {};
                    queueDatum.title = response.data.title;
                    queueDatum.channel = response.data.channel;
                    queueDatum.thumbnail = response.data.thumbnails.default;
                    data.push(queueDatum);
                })
                setQueueData([...data]);
            })
        }

        socket.on(Events.receive_room_state, state => {
            setMessages([...state.chatHistory]);
            setCurrentVideo(state.currentVideo);
            setQueue([...state.queue]);
            requestAll(state.queue);
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

        socket.on(Events.add_to_queue, (room, videoId) => {
            setQueue(prevState => [...prevState, videoId]);
            fetchVideoData(videoId).then(res => {
                console.log(res.data);
                let queueDatum = {};
                queueDatum.title = res.data.title;
                queueDatum.channel = res.data.channel;
                queueDatum.thumbnail = res.data.thumbnails.default;
                setQueueData(prevState => [...prevState, queueDatum]);
            }).catch(err => console.log(err));
        })

        socket.on(Events.remove_from_queue, queue => {
            log(queue);
            setQueue([...queue]);
            requestAll(queue);
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

    function removeFromQueue(index) {
        const isEmpty = queue.length === 0;
        const inBounds = !(index < 0) && (index < queue.length);
        log(`Attempting to remove video ${index}`)
        if(!isEmpty && inBounds) {
            socket.emit(Events.remove_from_queue, room, index);
        } else {
            log(`Error removing from queue`);
        }
    }

    function emitLoadVideo(index) {
        socket.emit('player load video', room, index);
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
                        <Container fluid>
                            <Row style={{minHeight:'300px'}}>
                                
                                <Col sm={12} md={8} style={{ padding:0}}>
                                <div style={{display: 'flex', padding: '1em' }}>
                                    <Button size="sm" variant="outline-danger" onClick={leaveRoom}>Leave Room</Button>
                                    <NameChangeModal socket={socket} alias={id} />
                                </div>
                                    <YoutubePlayer
                                        queue={queue}
                                        setQueue={setQueue}
                                        currentVideo={currentVideo}
                                        setCurrentVideo={setCurrentVideo}
                                        videoPlayer={videoPlayer} 
                                        setVideoPlayer={setVideoPlayer}
                                        socket={socket}
                                        room={room}/>
                                </Col>
                                <Col sm={12} md={4}>
                                    <div style={{display: 'flex' }}>
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
                                                <VideoQueue 
                                                    queue={queue}
                                                    queueData={queueData}
                                                    addToQueue={addToQueue}
                                                    removeFromQueue={removeFromQueue}
                                                    currentVideo={currentVideo}
                                                    setCurrentVideo={setCurrentVideo}
                                                    videoPlayer={videoPlayer}
                                                    emitLoadVideo={emitLoadVideo} />
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
