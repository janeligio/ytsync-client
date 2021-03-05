import { useState } from 'react';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { randomRoomNumber } from '../utility/utility';
import { AiFillDelete } from "react-icons/ai";

export default function VideoQueue(props) {
    const { queue, queueData, addToQueue, currentVideo, setCurrentVideo, removeFromQueue, videoPlayer, emitLoadVideo } = props;

    const loadVideo = (index) => {
        if(index !== currentVideo) {
            setCurrentVideo(index);
            const videoId = queue[index];
            if(videoPlayer) {
                videoPlayer.loadVideoById(videoId);
                videoPlayer.pauseVideo();
                emitLoadVideo(index);
            }
        }
    }

    const queueEl = queueData ? queueData.map((datum, index) => {
        const isPlaying = (currentVideo === index) ? true : false;
        return (
            <VideoData key={randomRoomNumber(10)} index={index} videoData={datum} loadVideo={loadVideo} removeFromQueue={removeFromQueue} isPlaying={isPlaying}/>
        );
    }) : null;

    return (
        <div className="youtube-queue">
            <Container className="youtube-queue-container" fluid>
                {queueData.length > 0 ? queueEl
                : <QueueSkeleton/>}
            </Container>
            <div style={{padding:'0'}}>
                <VideoQueueInput addToQueue={addToQueue}/>
            </div>
        </div>
    );
}

function QueueSkeleton() {
    return (
        <Row style={{background:'var(--p)', color: 'white', padding:'0.5em', fontSize:'0.9em', fontWeight:100}}>
            <Col style={{height:'1.5em'}}>
                <p style={{textAlign:'center'}}><em>Nothing here yet.</em></p>
            </Col>
        </Row>
    );
}

function VideoData({loadVideo, videoData, index, isPlaying, removeFromQueue}) {
    const thumbnail = videoData.thumbnail ? <Image fluid src={videoData.thumbnail.url} /> 
            :   <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>;
    const handlePlayVideo = () => loadVideo(index);
    const handleRemove = () => removeFromQueue(index);
    return(
        <Row style={{color: 'white', marginBottom:'0.25em'}}>
            <Col onClick={handlePlayVideo} style={{padding:0, background: (isPlaying?'var(--p)':'')}} className="queue-element-container">
                <div className="queue-element-index">
                    <small>{index+1}</small>
                </div>
                <div className="queue-element-thumbnail">
                    {thumbnail}
                </div>
                <div className="queue-element-info">
                    <h3 className="queue-element-title">{videoData.title}</h3>
                    <small className="queue-element-channel">{videoData.channel}</small>
                </div>
                <div className="queue-element-icon-container">
                    <AiFillDelete className="delete-icon" onClick={handleRemove}/>
                </div>
            </Col>
        </Row>)
}



const VideoQueueInput = ({addToQueue}) => {
    const [text, setText] = useState('');
    function _onKeyUp(e) {
        if(e.key === 'Enter' && e.keyCode === 13) {
            addToQueue(text);
            setText('');
        }
    }
    return (
        <FormControl
            style={{borderRadius:0}}
            id="youtube-queue-input"
            onKeyUp={e => _onKeyUp(e)}
            onChange={e =>  setText(e.target.value)}
            value={text}
            placeholder="Enter a Youtube URL"
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
        />
    );
};