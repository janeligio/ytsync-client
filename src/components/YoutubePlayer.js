import { useEffect, useState } from 'react';
import axios from 'axios';
import Youtube from 'react-youtube';
import Events from '../events/Events';
import Container from 'react-bootstrap/Container';

const { log, dir } = console;

export default function YoutubePlayer(props) {
    const {queue, setQueue, currentVideo, setCurrentVideo, room, socket } = props;
    const [videoPlayer, setVideoPlayer] = useState(undefined);
    const [joined, setJoined] = useState(false);
    const [interval, setIntervalState] = useState(null);

    useEffect(() => {
        // let interval = setInterval(() => {
        //     if(videoPlayer) {
        //         const currentTime = videoPlayer.getCurrentTime();
        //         const playerState = videoPlayer.getPlayerState();
        //         socket.emit('player set current state', room, { currentTime, playerState});
        //     }
        // }, 2000)

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

        socket.on('ping status', (message, callback) => {
            const status = { currentTime: 0, playerState: -1};
            if(videoPlayer) {
                status.currentTime = videoPlayer.getCurrentTime();
                status.playerState = videoPlayer.getPlayerState();
                log(`Received ping - Current Time:${status.currentTime}, Player State:${status.playerState}`);
                socket.emit({})
            }
        })
        return () => {
            if(interval) {
                clearInterval(interval);
            }
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
        // e.target.loadVideoById(queue[currentVideo]);
        // If you're the only one in the room, get the queue and cue up a video and pause it
        // If there are other people in the room, get the state of the room's video player
            // If paused, get the current time of the video and pause the video
            // If it's playing, get the current time of the video and play the video
        if(!joined) {
            log(`Getting room:${room} state.`)

            axios({
                method:'get',
                url: `/room/${room}`
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
        if(joined) {
            const currentTime = e.target.getCurrentTime();
            const playerState = e.target.getPlayerState();
            log(`Broadcasting player play:${currentTime} ${playerState}`);
            socket.emit(Events.player_play_at, room, currentTime, playerState);
        } else {
            setJoined(!joined);
            if(interval) {
                clearInterval(interval);
            } else {
                let interval = setInterval(() => {
                    const currentTime = e.target.getCurrentTime();
                    const playerState = e.target.getPlayerState();
                    socket.emit('player set current state', room, {currentTime, playerState});
                }, 2000);
                setIntervalState(interval);
            }
        }
        // socket.emit('player get state', callback => {
        //     const difference = callback.currentTime - currentTime;
        //     if(Math.abs(difference) > 5) {
        //         socket.emit('player play at', room, currentTime, playerState);
        //     } else {
        //         socket.emit('player play', room, currentTime, playerState);
        //     }
        // })
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
        <Container>  
            { queue.length > 0 ?
                <Youtube  
                    opts={opts}
                    videoId={queue[currentVideo]}
                    onReady={_onReady}
                    onPlay={_onPlay}                     // defaults -> noop
                    onPause={_onPause}                    // defaults -> noop
                    onEnd={_onEnd}
                    onStateChange={_onStateChange}/>
            :   <div style={{border:'1px solid white'}}>Place holder</div>
            }

        </Container>);
};