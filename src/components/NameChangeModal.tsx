import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FormControl from 'react-bootstrap/FormControl';
import { Socket } from 'socket.io-client';
import ServerToClientEvents from '../types/ServerToClientEvents';
import ClientToServerEvents, {
    ClientToServerEventsTypes,
} from '../types/ClientToServerEvents';

interface NameChangeModalProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    alias: string;
}

export default function NameChangeModal(props: NameChangeModalProps) {
    const { socket, alias } = props;

    const [show, setShow] = useState(false);
    const [text, setText] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSubmit = () => {
        setText('');
        socket.emit(ClientToServerEventsTypes.changeName, text);
        handleClose();
    };

    return (
        <>
            <Button
                style={{ marginLeft: '10px' }}
                size="sm"
                variant="outline-info"
                onClick={handleShow}
            >
                Change Name
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    Change your name from <em>{alias}</em> to
                    <FormControl
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
