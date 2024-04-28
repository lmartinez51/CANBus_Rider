import React, {useState} from 'react'
import { Modal, Form, Col } from 'react-bootstrap'
import "./ConnectModal.css"

export default function ConnectModal({ show, handleClose, handleOptionSelected }) {
    const [selectedOption, setSelectedOption] = useState({ host: '0.0.0.0', port: '35000' })

    const handleSubmit = (event) => {
        event.preventDefault()
        handleOptionSelected(selectedOption)
    }

    return (
        <div
        className="modal show"
        style={{ display: 'block', position: 'initial' }}
        >
            <Modal
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Choose an option for connecting.
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form className="deviceForm" onSubmit={handleSubmit}>
                        <Col xs="auto">
                            <Form.Check 
                                type="radio"
                                label="ELM327 Emulator"
                                value="0.0.0.0"
                                checked={selectedOption.host === '0.0.0.0'}
                                onChange={(e) => setSelectedOption({ host: e.target.value, port: '35000' })}
                            />
                            <Form.Check 
                                type="radio"
                                label="ELM327 WiFi"
                                value="192.168.0.10"
                                checked={selectedOption.host === '192.168.0.10'}
                                onChange={(e) => setSelectedOption({ host: e.target.value, port: '35000' })}
                            />
                            <Form.Check 
                                type="radio"
                                label="ELM327 Bluetooth"
                                value="/dev/ttyUSB0"
                                checked={selectedOption.host === '/dev/ttyUSB0'}
                                onChange={(e) => setSelectedOption({ host: e.target.value, port: '35000' })}
                            />
                            <Form.Check 
                                type="radio"
                                label="Other"
                                value="Other"
                                checked={selectedOption.host === 'Other'}
                                onChange={(e) => setSelectedOption({ host: e.target.value, port: '35000' })}
                            />
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button className='connectCancelButton' onClick={handleClose}>Cancel</button>
                    <button className='connectSubmitButton' onClick={handleSubmit}>Submit</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

