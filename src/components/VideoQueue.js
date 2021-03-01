import { useState, useEffect } from 'react';
import axios from 'axios';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';

export default function VideoQueue(props) {
    const { queue, addToQueue } = props;
    const [text, setText] = useState('');

    const queueEl = queue ? queue.map(q => {
        return (
            <VideoData key={q} videoId={q}/>
        );
    }) : null;

    function _onKeyUp(e) {
        if(e.key === 'Enter' && e.keyCode === 13) {
            addToQueue(text);
            setText('');
        }
    }
    return (
        <div className="youtube-queue">
            <Container fluid>
                {queue.length > 0 ? queueEl
                : <QueueSkeleton/>}
            </Container>
            <div style={{padding:'0'}}>
                <FormControl
                    style={{borderRadius:0}}
                    id="youtube-queue-input"
                    onKeyUp={_onKeyUp}
                    onChange={e => {
                        setText(e.target.value);
                    }}
                    value={text}
                    placeholder="Enter a Youtube URL"
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                />
            </div>
        </div>
    );
}

function QueueSkeleton() {
    return (
        <Row style={{background:'var(--p)', color: 'white', marginBottom:'0.25em', padding:'0.5em'}}>
            <Col>
            <p><em>Nothing here yet.</em></p>
            </Col>
        </Row>
    );
}

function VideoData({videoId}) {
    const [title, setTitle] = useState('');
    const [channel, setChannel] = useState('');
    const [thumbnailData, setThumbnailData] = useState(null);
    const API = 'https://ytsync-server.herokuapp.com';
    useEffect(() => {
        axios({
            method:'get',
            url:`${API}/video/${videoId}`
        }).then(res => {
            console.log(res.data);
            setTitle(res.data.title);
            setChannel(res.data.channelTitle);
            setThumbnailData(res.data.thumbnails.default);
        }).catch(e => console.log(e));
    }, [])
    //const thumbnail = thumbnailData && <img style={{width,height}} src={thumbnailData.url}/>
    const thumbnail = thumbnailData ? 
        <Image style={{padding:0,}} src={thumbnailData.url} /> 
        :
            <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
            </Spinner>;
    return(
        <Row style={{background:'var(--p)', color: 'white', marginBottom:'0.25em'}}>
            {thumbnail}
            <p style={{padding:'1em'}}>
                <h3 style={{fontSize:'1em'}}>{title}</h3>
                by {channel}
            </p>
        </Row>)
}