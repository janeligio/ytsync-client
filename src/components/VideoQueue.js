import { useState } from 'react';

export default function VideoQueue(props) {
    const { queue, addToQueue } = props;
    const [text, setText] = useState('');

    const queueEl = queue ? queue.map(q => {
        return (
            <li key={q}>{q}</li>
        );
    }) : null;
    return (
        <div className="youtube-queue">
            <ul>
                {queueEl}
            </ul>
            <span>
                <input style={{ width: '88%' }} value={text} onChange={e => setText(e.target.value)} />
                <button style={{ width: '10%' }} onClick={e => { addToQueue(text); setText('') }}>Add To Queue</button>
            </span>
        </div>
    );
}