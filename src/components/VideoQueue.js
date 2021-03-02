import { useState, useEffect } from 'react';
import axios from 'axios';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { randomRoomNumber, API } from '../utility/utility';

export default function VideoQueue(props) {
    const { queue, addToQueue, currentVideo } = props;

    const queueEl = queue ? queue.map((q, index) => {
        const isPlaying = (currentVideo === index) ? true : false;
        return (
            <VideoData key={randomRoomNumber(10)} index={index} videoId={q} isPlaying={isPlaying}/>
        );
    }) : null;

    return (
        <div className="youtube-queue">
            <Container className="youtube-queue-container" fluid>
                {queue.length > 0 ? queueEl
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

function VideoData({videoId, index, isPlaying}) {
    const [title, setTitle] = useState('');
    const [channel, setChannel] = useState('');
    const [thumbnailData, setThumbnailData] = useState(null);
    const endpoint = `${API}/video/${videoId}`;
    useEffect(() => {
        axios({
            method:'get',
            url:endpoint
        }).then(res => {
            console.log(res.data);
            setTitle(res.data.title);
            setChannel(res.data.channelTitle);
            setThumbnailData(res.data.thumbnails.default);
        }).catch(e => console.log(e));
    }, [])
    const thumbnail = thumbnailData ? <Image fluid src={thumbnailData.url} /> 
            :   <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>;
    return(
        <Row style={{color: 'white', marginBottom:'0.25em'}}>
            <Col style={{padding:0, background: (isPlaying?'var(--p)':'')}} className="queue-element-container">
                <div className="queue-element-index">
                    <small>{index+1}</small>
                </div>
                <div className="queue-element-thumbnail">
                    {thumbnail}
                </div>
                <div className="queue-element-info">
                    <h3 className="queue-element-title">{title}</h3>
                    <small className="queue-element-channel">{channel}</small>
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