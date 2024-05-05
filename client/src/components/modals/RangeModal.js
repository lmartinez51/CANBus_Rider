import React, { useState } from 'react'
import { Modal, Form } from 'react-bootstrap'
import './RangeModal.css'

export default function RangeModal({ show, handleClose, handleCustomRange }) {
    const [range, setRange] = useState({ filter: '', mask: '' })

    const handleChange = (event) => {
        const { name, value } = event.target
        // Verifica si el valor es un número hexadecimal y si no excede los 3 caracteres
        if (/^[0-9a-fA-F]{0,3}$/.test(value)) {
            setRange(prevState => ({ ...prevState, [name]: value }))
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        // Verifica si filter y mask están definidos antes de llamar a handleCustomRange
        if (range.filter && range.mask) {
            // Rellena con ceros los caracteres faltantes hasta llegar a tres caracteres
            const paddedRange = {
                filter: range.filter.padStart(3, '0'),
                mask: range.mask.padStart(3, '0')
            };
            handleCustomRange(paddedRange)
            setRange({ filter: '', mask: '' }) // Aquí se hace 'reset' a la variable y se vuelve a sus valores por defecto
        } else {
            alert('Please provide values for both the filter and mask.')
        }
    }

    return (
        <div
            className="modal show"
            style={{ display: 'block', position: 'initial' }}
        >
            <Modal
                contentClassName='rangeModal'
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Custom Range.
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form className="rangeForm" >
                        <div className="form-group">
                            <label>Filter:</label>
                            <input className='filterInput' type='text' placeholder='###' name='filter' value={range.filter} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Mask:</label>
                            <input className='maskInput' type='text' placeholder='###' name='mask' value={range.mask} onChange={handleChange} />
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer className='range-footer'>
                    <button className='rangeCancelButton' onClick={handleClose}>Cancel</button>
                    <button className='rangeSubmitButton' onClick={handleSubmit}>Submit</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
