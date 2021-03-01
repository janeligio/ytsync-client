import { useState } from 'react';
import { displayTimestamp, randomRoomNumber} from '../utility/utility';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

export default function ChatBox({ messages, sendMessage, emitUserTyping, usersTyping }) {
    const [text, setText] = useState('');

    function _onKeyUp(e) {
        if(e.key === 'Enter' && e.keyCode === 13) {
            sendMessage(text); 
            setText('');
        }
    }

    const MessagesEl = messages.map(m => {
        const timestamp = <small className="message-timestamp">{displayTimestamp(m.timestamp)}</small>;
        return (
            <ListGroup.Item className="message" key={randomRoomNumber(10)}>
                <Card style={{ width: '100%', background:'inherit' }}>
                <Card.Body style={{padding:0}}>
                    { m.messageType === 'chat' 
                        && <Card.Title style={{fontSize:'1em'}}>{m.userId} {timestamp}</Card.Title>}
                    <Card.Text style={{fontSize:'1.em'}}>
                        {m.message} 
                        {` `}
                        {m.messageType === 'welcome' && timestamp} 
                        {m.messageType === 'fairwell' && timestamp}
                    </Card.Text>
                </Card.Body>
                </Card>
            </ListGroup.Item>)
    });

    return (
        <div className="message-container-wrapper">
            <ListGroup>
                { messages.length > 0 ? MessagesEl 
                : <MessagesSkeleton/>}
                <UsersTyping usersTyping={usersTyping}/>
            </ListGroup>
            <InputGroup className="mb-3">
                <FormControl
                    onKeyUp={_onKeyUp}
                    onChange={e => {
                        setText(e.target.value);
                        emitUserTyping();
                    }} 
                    value={text}
                    placeholder=""
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                    />
                <InputGroup.Append>
                <Button className="home" onClick={() => { sendMessage(text); setText('') }} block>Send</Button> 
                </InputGroup.Append>        
            </InputGroup>
        </div>
    );
};

function UsersTyping(props) {
    const { usersTyping } = props;
    let users = usersTyping || [];
    let usersTypingEl = <ListGroup.Item className="message"></ListGroup.Item>;
    if(users.length > 0) {
        if(users.length === 1) {
            usersTypingEl = 
                <ListGroup.Item className="message">
                    <Card style={{ width: '100%', background:'inherit' }}>
                        <Card.Body style={{padding:0}}>
                            <Card.Text style={{fontSize:'0.8em', textAlign:'center'}}>
                                {users.join()} is typing...
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </ListGroup.Item>;
        } else {
            usersTypingEl =
            <ListGroup.Item className="message">
                <Card style={{ width: '100%', background:'inherit' }}>
                    <Card.Body style={{padding:0}}>
                        <Card.Text style={{fontSize:'0.8em', textAlign:'center'}}>
                            {users.join(', ')} are typing...
                        </Card.Text>
                    </Card.Body>
                </Card>
            </ListGroup.Item>;
        }
    }
    return (usersTypingEl);
}

function MessagesSkeleton() {
    return (
        <ListGroup.Item className="message">
                <Card style={{ width: '100%', background:'inherit' }}>
                <Card.Body style={{padding:0}}>
                    <Card.Text style={{fontSize:'1.em'}}>
                        <em>Send the first chat!</em>
                    </Card.Text>
                </Card.Body>
                </Card>
            </ListGroup.Item>
    );
}