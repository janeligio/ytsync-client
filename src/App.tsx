import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import axios, { AxiosPromise } from 'axios';
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

import ClientToServerEvents, {
    ClientToServerEventsTypes,
} from './types/ClientToServerEvents';

import ServerToClientEvents, {
    ServerToClientEventsTypes,
} from './types/ServerToClientEvents';
import Message from './types/Message';
import QueueItem from './types/QueueItem';
import CallBackMessage, { Status } from './types/CallBackMessage';

const { log } = console;

const SERVER_API =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : (process.env.REACT_APP_SERVER_API as string);

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(SERVER_API);

export default function App(): JSX.Element {
    const [id, setId] = useState('');
    const [room, setRoom] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [usersTyping, setUsersTyping] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [queue, setQueue] = useState<string[]>([]);
    const [queueData, setQueueData] = useState<QueueItem[]>([]);
    const [videoPlayer, setVideoPlayer] = useState(undefined);
    const [currentVideo, setCurrentVideo] = useState(0);
    const [currentView, setCurrentView] = useState('Home');
    const [alert, setAlert] = useState('');

    useEffect(() => {
        socket.on('connect', () => {
            log('connected');
        });

        socket.on(ServerToClientEventsTypes.assignAlias, (id) => setId(id));

        socket.on(
            ServerToClientEventsTypes.receiveMessage,
            (message: Message) => {
                message.timestamp = new Date(message.timestamp);
                setMessages((m) => [...m, message]);
            }
        );

        socket.on(
            ServerToClientEventsTypes.receiveMessage,
            (roomState: {
                chatHistory: Message[];
                queue: string[];
                currentVideo: number;
            }) => {
                const { chatHistory, queue, currentVideo } = roomState;
                setMessages([...chatHistory]);
            }
        );

        const fetchVideoData = (
            videoId: string
        ): AxiosPromise<{
            title: string;
            channel: string;
            thumbnails: {
                default: string;
            };
        }> => {
            const endpoint = `${process.env.REACT_APP_SERVER_API}/video/${videoId}`;

            // TODO: Add types of data to the response
            return axios({
                method: 'get',
                url: endpoint,
            });
        };

        const requestAll = async (videoIds: string[]) => {
            const queueDataPromises = videoIds.map((videoId) =>
                fetchVideoData(videoId)
            );

            await Promise.all(queueDataPromises).then((responses) => {
                const queueItems = responses.map((response) => {
                    const queueItem: QueueItem = {
                        title: response.data.title,
                        channel: response.data.channel,
                        thumbnail: response.data.thumbnails.default,
                    };

                    return queueItem;
                });
                setQueueData([...queueItems]);
            });
        };

        socket.on(
            ServerToClientEventsTypes.receiveRoomState,
            (roomState: {
                chatHistory: Message[];
                queue: string[];
                currentVideo: number;
            }) => {
                const { chatHistory, queue, currentVideo } = roomState;

                setMessages([...chatHistory]);
                setCurrentVideo(currentVideo);
                setQueue([...queue]);

                requestAll(queue);
            }
        );

        socket.on(ServerToClientEventsTypes.getCurrentVideo, (currentVideo) => {
            setCurrentVideo(currentVideo);
        });

        const handleOnTyping = (userId: string) => {
            setUsersTyping((prevState) => {
                const set = new Set([...prevState, userId]);
                return Array.from(set.values());
            });
            setTimeout(() => {
                setUsersTyping((prevState) => {
                    const newSet = new Set([...prevState]);
                    newSet.delete(userId);
                    return Array.from(newSet.values());
                });
            }, 1000);
        };

        socket.on(ServerToClientEventsTypes.typing, (userId: string) => {
            handleOnTyping(userId);
        });

        socket.on(ServerToClientEventsTypes.addToQueue, (roomId, videoId) => {
            setQueue((prevState) => [...prevState, videoId]);

            fetchVideoData(videoId)
                .then((res) => {
                    console.log(res.data);

                    const queueItem = {
                        title: res.data.title,
                        channel: res.data.channel,
                        thumbnail: res.data.thumbnails.default,
                    };

                    setQueueData((prevState) => [...prevState, queueItem]);
                })
                .catch((err) => console.log(err));
        });

        socket.on(
            ServerToClientEventsTypes.removeFromQueue,
            (queue: string[]) => {
                log(queue);
                setQueue([...queue]);
                requestAll(queue);
            }
        );

        return () => {
            socket.removeAllListeners();
        };
    }, []);

    function createRoom() {
        socket.emit(
            ClientToServerEventsTypes.createRoom,
            id,
            (message: CallBackMessage) => {
                if (message.status === Status.SUCCESS) {
                    if (!message.room) {
                        console.error('No room was returned');
                    } else {
                        setRoom(message.room);
                        setCurrentView('Room');
                    }
                }
            }
        );
    }

    function joinRoom() {
        socket.emit(
            ClientToServerEventsTypes.joinRoom,
            room,
            (message: CallBackMessage) => {
                if (message.status === Status.SUCCESS) {
                    setRoom(message.room!);
                    setCurrentView('Room');
                } else {
                    setAlert(message.error!);
                    setRoom('');
                }
            }
        );
    }

    function leaveRoom() {
        socket.emit(
            ClientToServerEventsTypes.leaveRoom,
            room,
            (message: CallBackMessage) => {
                if (message.status === Status.SUCCESS) {
                    setRoom('');
                    setCurrentView('Home');
                }
            }
        );
    }

    function sendMessage(text: string) {
        socket.emit(ClientToServerEventsTypes.sendMessage, room, id, text);
    }

    function emitUserTyping() {
        if (!isTyping) {
            setIsTyping(true);
            socket.emit(ClientToServerEventsTypes.typing, room, id);

            // TODO: Properly remove timeout reference
            // clearTimeout function
            setTimeout(() => {
                setIsTyping(false);
            }, 1000);
        }
    }

    function copyRoom() {
        navigator.clipboard.writeText(room);
    }

    function addToQueue(video: string) {
        const videoId = parseURL(video);
        if (videoId.length > 0) {
            socket.emit(ClientToServerEventsTypes.addToQueue, room, videoId);
        } else {
            // Error
        }
    }

    function removeFromQueue(index: number) {
        const isEmpty = queue.length === 0;
        const inBounds = !(index < 0) && index < queue.length;

        log(`Attempting to remove video ${index}`);

        if (!isEmpty && inBounds) {
            socket.emit(ClientToServerEventsTypes.removeFromQueue, room, index);
        } else {
            log(`Error removing from queue`);
        }
    }

    function emitLoadVideo(index: number) {
        socket.emit(ClientToServerEventsTypes.loadVideo, room, index);
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>YTsync</h1>
            </header>
            <main>
                {currentView === 'Home' && (
                    <Home
                        room={room}
                        setRoom={setRoom}
                        joinRoom={joinRoom}
                        createRoom={createRoom}
                        alert={alert}
                        setAlert={setAlert}
                    />
                )}
                {currentView === 'Room' && (
                    <Room>
                        <Container fluid>
                            <Row style={{ minHeight: '300px' }}>
                                <Col sm={12} md={8} style={{ padding: 0 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            padding: '1em',
                                        }}
                                    >
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={leaveRoom}
                                        >
                                            Leave Room
                                        </Button>
                                        <NameChangeModal
                                            socket={socket}
                                            alias={id}
                                        />
                                    </div>
                                    <YoutubePlayer
                                        queue={queue}
                                        setQueue={setQueue}
                                        currentVideo={currentVideo}
                                        setCurrentVideo={setCurrentVideo}
                                        videoPlayer={videoPlayer}
                                        setVideoPlayer={setVideoPlayer}
                                        socket={socket}
                                        emitLoadVideo={emitLoadVideo}
                                        room={room}
                                    />
                                </Col>
                                <Col sm={12} md={4}>
                                    <div style={{ display: 'flex' }}>
                                        <p
                                            onClick={copyRoom}
                                            className="room-text"
                                        >
                                            Room: {` `}
                                            <span className="room-number">
                                                #{room}
                                            </span>
                                        </p>
                                        <p className="room-text">Name: {id} </p>
                                    </div>
                                    <TabContainer defaultActiveKey="chat">
                                        <Nav style={{ marginBottom: 1 }}>
                                            <Nav.Item className="tab-link-parent">
                                                <Nav.Link
                                                    className="tab-link"
                                                    eventKey="chat"
                                                >
                                                    Chat
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item className="tab-link-parent">
                                                <Nav.Link
                                                    className="tab-link"
                                                    eventKey="queue"
                                                >
                                                    Queue
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        <TabContent>
                                            <TabPane eventKey="chat">
                                                <ChatBox
                                                    messages={messages}
                                                    sendMessage={sendMessage}
                                                    emitUserTyping={
                                                        emitUserTyping
                                                    }
                                                    usersTyping={usersTyping}
                                                />
                                            </TabPane>
                                            <TabPane eventKey="queue">
                                                <VideoQueue
                                                    queue={queue}
                                                    queueData={queueData}
                                                    addToQueue={addToQueue}
                                                    removeFromQueue={
                                                        removeFromQueue
                                                    }
                                                    currentVideo={currentVideo}
                                                    setCurrentVideo={
                                                        setCurrentVideo
                                                    }
                                                    videoPlayer={videoPlayer}
                                                    emitLoadVideo={
                                                        emitLoadVideo
                                                    }
                                                />
                                            </TabPane>
                                        </TabContent>
                                    </TabContainer>
                                </Col>
                            </Row>
                        </Container>
                    </Room>
                )}
            </main>
            <Footer />
        </div>
    );
}

function Home(props: any) {
    const { setRoom, joinRoom, createRoom, alert, setAlert } = props;
    return (
        <Container className="home-parent" fluid>
            <div className="home-child">
                <Button className="home" onClick={createRoom} block>
                    Create Room
                </Button>
                <p className="home">Or</p>
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <Button className="home" onClick={joinRoom} block>
                            Join Room
                        </Button>
                    </InputGroup.Prepend>
                    <FormControl
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Room #"
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                    />
                </InputGroup>
                {alert && <AlertMessage alert={alert} setAlert={setAlert} />}
            </div>
        </Container>
    );
}

function Room(props: { children: JSX.Element }) {
    return props.children;
}

function AlertMessage(props: {
    alert: string;
    setAlert: React.Dispatch<React.SetStateAction<string>>;
}) {
    const [show, setShow] = useState(true);
    const { alert, setAlert } = props;
    if (show) {
        return (
            <Alert
                variant="danger"
                onClose={() => {
                    setShow(false);
                    setAlert('');
                }}
                dismissible
            >
                {alert}
            </Alert>
        );
    }
    return null;
}
