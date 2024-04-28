import React, {useState} from 'react'
import { Modal, Form } from 'react-bootstrap'
import './NoteModal.css'

export default function NoteModal({ show, handleClose, handleSaveNote }) {
    const [note, setNote] = useState('')

    const handleChange = (event) => {
        setNote(event.target.value)
      }

    const handleSubmit = (event) => {
        event.preventDefault()
        handleSaveNote(note)
        setNote('')
    }

    return (
        <div
            className="modal show"
            style={{ display: 'block', position: 'initial' }}
        >
            <Modal
                contentClassName='noteModal'
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title as='h6' id="contained-modal-title-vcenter">
                        Add Note.
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form className="noteForm" onSubmit={handleSubmit}>
                        <input className='modalInput' type='text' placeholder='Note' value={note} onChange={handleChange} />
                    </Form>
                        {/* <div className="buttonContainer">
                            <button className='noteCancelButton' onClick={handleClose}>Close</button>
                            <button className='noteSaveButton' onClick={handleSubmit}>Save</button>
                        </div> */}
                </Modal.Body>
                <Modal.Footer>
                    <button className='noteCancelButton' onClick={handleClose}>Close</button>
                    <button className='noteSaveButton' onClick={handleSubmit}>Save</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
