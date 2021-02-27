import { useEffect, useState } from 'react';
import Youtube from 'react-youtube';
import Events from '../events/Events';
import Container from 'react-bootstrap/Container';

const { log, dir } = console;

export default function YoutubePlayer(props) {
    const {queue, setQueue, currentVideo, setCurrentVideo, room, socket } = props;
    const [videoPlayer, setVideoPlayer] = useState(undefined);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        let interval = setInterval(() => {
            if(videoPlayer) {
                socket.emit('player set current time', room, videoPlayer.getCurrentTime());
            }
        }, 2000)

        socket.on('player play', (room, currentTime, playerState) => {
            log(videoPlayer);
            if(videoPlayer) {
                const timeDifference = currentTime - videoPlayer.getCurrentTime();
                if(Math.abs(timeDifference) > 5) {
                    videoPlayer.seekTo(currentTime, true);
                    videoPlayer.playVideo();
                } else {
                    videoPlayer.playVideo();
                }
            }
        })
        socket.on('player pause', (room, playerState, currentTime) => {
            log('received pause event')
            if(videoPlayer) {
                videoPlayer.seekTo(currentTime);
                videoPlayer.pauseVideo();
            }
        })

        return () => {
            clearInterval(interval);
        }
    }, [videoPlayer, socket, currentVideo, queue, setCurrentVideo, setQueue])

    const opts = {
        // height:'390', width:'640',
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
        e.target.loadVideoById(queue[currentVideo]);
        // If you're the only one in the room, get the queue and cue up a video and pause it
        // If there are other people in the room, get the state of the room's video player
            // If paused, get the current time of the video and pause the video
            // If it's playing, get the current time of the video and play the video
        socket.emit(Events.player_get_status, room, callback => {
            const { state, currentTime } = callback;
            console.log(`Current time: ${currentTime}`)
            console.log(`typeof State:${typeof state}`)
            if(state === -1 || state === 2) {
                e.target.seekTo(currentTime, true);
                e.target.pauseVideo();
            } else if(state === 1) {
                e.target.seekTo(currentTime, true);
                e.target.playVideo();
            }
        })

    }
    function _onPlay(e) {
        console.log(`status:playing`)
        if(joined) {
            const currentTime = e.target.getCurrentTime();
            const playerState = e.target.getPlayerState();
            socket.emit('player play', room, currentTime, playerState);
        } else if(!joined) {
            setJoined(!joined);
        }
    }
    function _onPause(e) {
        log('emitting pause')
        if(joined) {
            const playerState = e.target.getPlayerState();
            const currentTime = e.target.getCurrentTime();
            socket.emit('player pause', room, playerState, currentTime);
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
        <Container>  { queue.length > 0 ?
                <Youtube  opts={opts} 
                onReady={_onReady}
                onPlay={_onPlay}                     // defaults -> noop
                onPause={_onPause}                    // defaults -> noop
                onEnd={_onEnd}
                onStateChange={_onStateChange}/>
            :   <div style={{border:'1px solid white'}}>Place holder</div>
            }

        </Container>);
};