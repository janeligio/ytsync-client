
import {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FormControl from 'react-bootstrap/FormControl';

export default function NameChangeModal({socket, alias}) {
    const [show, setShow] = useState(false);
    const [text, setText] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = () => {
        setText('');
        socket.emit('change name', text);
        handleClose();
    }
    return (
        <>
        <Button size="sm" variant="info" onClick={handleShow}>Change Name</Button>
        <Modal show={show} onHide={handleClose}>
            <Modal.Body>Change your name from <em>{alias}</em> to
                <FormControl
                    onChange={e => setText(e.target.value)} 
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