import { useEffect, useState } from 'react';
import Youtube from 'react-youtube';
import VideoQueue from './VideoQueue';

const { log, dir } = console;

export default function YoutubePlayer(props) {
    const {queue, currentVideo, addToQueue, room, socket } = props;
    const [videoPlayer, setVideoPlayer] = useState(undefined);

    useEffect(() => {
        socket.on('player play', (room, currentTime) => {
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
        socket.on('player pause', () => {
            log('received pause event')
            if(videoPlayer) {
                videoPlayer.pauseVideo();
            }
        })
    }, [videoPlayer, socket])

    const opts = {
        height:'390', width:'640',
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
        e.target.pauseVideo();
    }
    function _onPlay(e) {
        const currentTime = e.target.getCurrentTime();
        socket.emit('player play', room, currentTime);
    }
    function _onPause(e) {
        log('emitting pause')
        socket.emit('player pause', room);
    }
    function _onEnd(e) {
    }
    function _onStateChange(e) {
        log(e);
        
    }
    return (
        <>
            <Youtube videoId={queue[currentVideo]} opts={opts} 
                onReady={_onReady}
                onPlay={_onPlay}                     // defaults -> noop
                onPause={_onPause}                    // defaults -> noop
                onEnd={_onEnd}
                onStateChange={_onStateChange}/>
            <VideoQueue queue={queue} addToQueue={addToQueue}/>
        </>);
};