import { useState } from 'react';
import { displayTimestamp, randomRoomNumber } from '../utility/utility';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import FormControl from 'react-bootstrap/FormControl';
import Message, { MessageType } from '../types/Message';

interface ChatBoxProps {
    messages: Message[];
    sendMessage: (text: string) => void;
    emitUserTyping: () => void;
    usersTyping: string[];
}
export default function ChatBox(props: ChatBoxProps): JSX.Element {
    const { messages, sendMessage, emitUserTyping, usersTyping } = props;
    const MessagesEl = messages.map((m) => {
        const timestamp = (
            <small className="message-timestamp">
                {displayTimestamp(m.timestamp)}
            </small>
        );
        return (
            <ListGroup.Item className="message" key={randomRoomNumber(10)}>
                <Card
                    style={{
                        width: '100%',
                        background: 'inherit',
                        border: 'none',
                    }}
                >
                    <Card.Body style={{ padding: 0 }}>
                        {m.messageType === MessageType.Chat && (
                            <Card.Title style={{ margin: 0 }}>
                                {timestamp}{' '}
                                <span className="message-user-id">
                                    {m.userId}
                                </span>{' '}
                            </Card.Title>
                        )}
                        <Card.Text className="message-text">
                            {m.message}
                            {` `}
                            {m.messageType === MessageType.Welcome && timestamp}
                            {m.messageType === MessageType.Fairwell &&
                                timestamp}
                        </Card.Text>
                    </Card.Body>
                </Card>
            </ListGroup.Item>
        );
    });

    return (
        <div className="message-container-wrapper">
            <ListGroup className="message-container">
                {messages.length > 0 ? MessagesEl : <MessagesSkeleton />}
                <UsersTyping usersTyping={usersTyping} />
            </ListGroup>
            <ChatBoxInput
                sendMessage={sendMessage}
                emitUserTyping={emitUserTyping}
            />
        </div>
    );
}

function UsersTyping(props: { usersTyping: string[] }) {
    const { usersTyping } = props;
    let users = usersTyping || [];
    let usersTypingEl = <ListGroup.Item className="message"></ListGroup.Item>;
    if (users.length > 0) {
        if (users.length === 1) {
            usersTypingEl = (
                <ListGroup.Item className="message">
                    <Card
                        style={{
                            width: '100%',
                            background: 'inherit',
                            border: 'none',
                        }}
                    >
                        <Card.Body style={{ padding: 0 }}>
                            <Card.Text
                                style={{
                                    fontSize: '0.8em',
                                    textAlign: 'center',
                                }}
                            >
                                {users.join()} is typing...
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </ListGroup.Item>
            );
        } else {
            usersTypingEl = (
                <ListGroup.Item className="message">
                    <Card
                        style={{
                            width: '100%',
                            background: 'inherit',
                            border: 'none',
                        }}
                    >
                        <Card.Body style={{ padding: 0 }}>
                            <Card.Text
                                style={{
                                    fontSize: '0.8em',
                                    textAlign: 'center',
                                }}
                            >
                                {users.join(', ')} are typing...
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </ListGroup.Item>
            );
        }
    }
    return usersTypingEl;
}

interface ChatBoxInputProps {
    sendMessage: (text: string) => void;
    emitUserTyping: () => void;
}

function ChatBoxInput(props: ChatBoxInputProps) {
    const { sendMessage, emitUserTyping } = props;
    const [text, setText] = useState('');

    function handleOnKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' && e.keyCode === 13) {
            sendMessage(text);
            setText('');
        }
    }
    return (
        <FormControl
            style={{ borderRadius: 0 }}
            id="chatbox-input"
            onKeyUp={handleOnKeyUp}
            onChange={(e) => {
                setText(e.target.value);
                emitUserTyping();
            }}
            value={text}
            placeholder="Something interesting..."
            aria-label="Default"
            aria-describedby="inputGroup-sizing-default"
        />
    );
}

function MessagesSkeleton() {
    return (
        <ListGroup.Item className="message">
            <Card
                style={{ width: '100%', background: 'inherit', border: 'none' }}
            >
                <Card.Body style={{ padding: 0 }}>
                    <Card.Text style={{ fontSize: '1.em' }}>
                        <em>Send the first chat!</em>
                    </Card.Text>
                </Card.Body>
            </Card>
        </ListGroup.Item>
    );
}
