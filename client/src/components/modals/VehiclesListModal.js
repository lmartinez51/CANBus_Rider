import React, {useState} from 'react'
import { Modal } from 'react-bootstrap'
import "./VehiclesListModal.css"

export default function ConnectModal({ show, handleClose, projects, handleVehicleSelected }) {
    const [selectedVehicle, setSelectedVehicle] = useState('')

    const handleChange = (event) => {
        setSelectedVehicle(event.target.value);
    }

    const handleSubmit = () => {
        if (selectedVehicle !== '') {
            handleVehicleSelected(selectedVehicle);
            handleClose();
        } else {
            alert('Please select a vehicle');
        }
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
                        Choose a vehicle.
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="select-container">
                        <select className='vehicleSelect' onChange={handleChange}>
                            <option value="">Select an option</option>
                            {projects.map(project => (
                            <option className='vehicleOption' key={project._id} value={project._id}>
                                    {project.projectName}
                            </option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className='connectCancelButton' onClick={handleClose}>Cancel</button>
                    <button className='connectSubmitButton' onClick={handleSubmit}>Submit</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
