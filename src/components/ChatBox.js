import { useState } from 'react';
import { displayTimestamp, randomRoomNumber} from '../utility/utility';

export default function ChatBox({ room, messages, sendMessage, emitUserTyping, usersTyping }) {
    const [text, setText] = useState('');

    const messageContainerStyle = {
        padding: 0,
        margin: 0,
        height: 500,
        overflowY:'scroll',
    }
    const messageStyle = {
        listStyleType: 'none',
    }

    let typing = [...usersTyping] || [];
    let usersTypingEl = <li></li>;
    if(typing.length > 0) {
        if(typing.length === 1) {
            usersTypingEl = <li>User#{typing.join()} is typing...</li>;
        } else {
            usersTypingEl = <li>User#{typing.join(', ')} are typing...</li>;
        }
    }
    return (
        <div className="message-container-wrapper">
            <p style={{ margin: 0, textAlign:'right' }}>Room #{room}</p>
            <ul style={messageContainerStyle}>
                {messages.map((m, index) => {
                    const background = (index % 2 === 0) ? '#efefef' : 'white';
                    const userId = <b className="message-user-id">User#{m.userId}</b> 
                    const message = <span className="message-text">{m.message}</span>;
                    const timestamp = <small className="message-timestamp">{displayTimestamp(m.timestamp)}</small>;
                    return (
                        <li key={randomRoomNumber(10)} style={{...messageStyle, background}}>
                            <p style={{lineHeight:'1.5em', margin:0, padding:'0.5em'}}>
                                {userId} {message} {timestamp}
                            </p>
                        </li>)
                })}
                { usersTypingEl }
            </ul>
            <span>
                <input style={{ width: '88%' }} value={text} onChange={e => {
                    setText(e.target.value);
                    emitUserTyping();
                }} />
                <button style={{ width: '10%' }} onClick={e => { sendMessage(text); setText('') }}>Send</button>
            </span>
        </div>
    );
};