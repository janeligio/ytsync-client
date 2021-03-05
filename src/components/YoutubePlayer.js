import { useEffect, useState } from 'react';
import axios from 'axios';
import Youtube from 'react-youtube';
import Events from '../events/Events';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const { log, dir } = console;

export default function YoutubePlayer(props) {
    const {queue, setQueue, currentVideo, setCurrentVideo, room, socket, videoPlayer, setVideoPlayer } = props;
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        socket.on('player play', () => {
            log(`Event: player play`);
            if(videoPlayer) {
                videoPlayer.playVideo();
            }
        })
        socket.on('player play at', data => {
            log(`Event: player play at ${data.currentTime}`);
            if(videoPlayer) {
                const difference = data.currentTime - videoPlayer.getCurrentTime();
                if(Math.abs(difference) > 5) {
                    log(`Difference: ${difference}`, `Seeking to ${data.currentTime}`)
                    videoPlayer.seekTo(data.currentTime, true);
                    videoPlayer.playVideo();
                } else {
                    videoPlayer.playVideo();
                }
            }
        })
        socket.on('player pause', () => {
            log(`Event: player pause`);
            if(videoPlayer) {
                videoPlayer.pauseVideo();
            }
        })
        socket.on('player load video', index => {
            log(`Event: load video #${index}`);
            if(videoPlayer) {
                videoPlayer.loadVideoById(queue[index]);
                videoPlayer.pauseVideo();
            }
        });
    }, [videoPlayer, socket, currentVideo, queue, setCurrentVideo, setQueue])

    const opts = {
        playerVars: {
            autoplay:1,
            controls:1, // Show the controls or not
            modestbranding:1
        }
    };
    // Youtube player event handlers;
    function _onReady(e) {
        setVideoPlayer(e.target);
        dir(videoPlayer);
        if(!joined) {
            log(`Getting room:${room} state.`)
            axios({
                method:'get',
                url: `${process.env.REACT_APP_SERVER_API}/room/${room}`
            }).then(res => {
                log(`Got room:${room} state.`)
                log(`Current time:${res.data.currentTime}`, `Player state:${res.data.playerState}`);
                e.target.seekTo(res.data.currentTime);
                if(res.playerState === -1 || res.playerState === 2) {
                    e.target.pauseVideo();
                } else if(res.data.playerState === 1) {
                    e.target.playVideo();
                }
            }).catch(err => log(`Error getting room state`, err));
        }

    }
    function _onPlay(e) {
        const currentTime = e.target.getCurrentTime();
        const playerState = e.target.getPlayerState();
        if(joined) {
            log(`Broadcasting player play:${currentTime} ${playerState}`);
            socket.emit(Events.player_play_at, room, currentTime, playerState);
            socket.emit('player start interval', room, currentTime);
        } else {
            setJoined(!joined);
            socket.emit('player start interval', room, currentTime);
        }
    }
    function _onPause(e) {
        log('emitting pause')
        const currentTime = e.target.getCurrentTime();
        const playerState = e.target.getPlayerState();
        if(joined) {
            socket.emit('player pause', room, playerState, currentTime);
            socket.emit('player stop interval', room, currentTime);
        } else if(!joined) {
            setJoined(!joined);
        }
    }
    function _onEnd(e) {
    }
    function _onStateChange(e) {
        log(e.target.getPlayerState());    
    }


    return (
        <>  
            { queue.length > 0 ?
                <Youtube
                    className="youtube-player"
                    containerClassName="youtube-player-container" 
                    opts={opts}
                    videoId={queue[currentVideo]}
                    onReady={_onReady}
                    onPlay={_onPlay}                     // defaults -> noop
                    onPause={_onPause}                    // defaults -> noop
                    onEnd={_onEnd}
                    onStateChange={_onStateChange}/>
            :   <YoutubePlayerSkeleton                     onClick={() => log('clickity clack')}
            />
            }

        </>);
};

function YoutubePlayerSkeleton() {
    return (
        <Container>
            <Row>
                <Col className="youtube-player-skeleton">
                    <h3>
                        Add a youtube video...
                    </h3>
                </Col>
            </Row>
        </Container>
    );
}