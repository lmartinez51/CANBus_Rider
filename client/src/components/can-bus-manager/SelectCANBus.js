import React, { useState } from 'react';
import { Form, Col, Row, Spinner, Alert } from "react-bootstrap";
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./SelectCANBus.css";
const url = 'http://localhost:8080/can';


function SelectCAN() {
     const [CAN, setCAN] = useState('can0');
     const [rate, setRate] = useState('125000');
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [statusMessage, setStatusMessage] = useState(null);

     const handleSubmit = (event) => {
          // prevents the submit button from refreshing the page
          event.preventDefault();
          setIsSubmitting(true);
          setStatusMessage(null);
          console.log(CAN);
          console.log(rate);
          const data = {params: {CAN: CAN, rate: rate}};
          axios.get(url, data)
               .then((response) => {
                    console.log(response.data);
                    setStatusMessage({ variant: 'success', text: 'CAN Bus configured successfully!' });
               })
               .catch((error) => {
                    console.error(error);
                    setStatusMessage({ variant: 'danger', text: 'Failed to configure CAN Bus. Please try again.' });
               })
               .finally(() => {
                    setIsSubmitting(false);
               });
      };

     function handleChange(event) {
          setCAN(event.target.value);
     }

     function handleChangeCheck(event) {
          setRate(event.target.value);
        }

     return (
          <Form onSubmit={handleSubmit}>
               <Form.Group controlId="custom-select">
                    <Form.Label>Select CAN Bus</Form.Label>
                    <Form.Select className="rounded-0 shadow" onChange={handleChange} value={CAN}>
                         <option value={'can0'}>CAN Bus #1</option>
                         <option value={'can1'}>CAN Bus #2</option>
                         <option value={'can2'}>CAN Bus #3</option>
                    </Form.Select>
               </Form.Group>
               <br></br><br></br>
               <hr />
               <Form.Group as={Row}>
                    <Form.Label as="legend" column sm={2}>
                          Rate
                    </Form.Label>
                    <Col sm={2}>
                         <Form.Check
                              type="radio"
                              label="125 kbps"
                              name="radios"
                              id="formHorizontalRadios1"
                              value='125000'
                              checked={rate === '125000'}
                              onChange={handleChangeCheck}
                         />
                         <Form.Check
                              type="radio"
                              label="250 kbps"
                              name="radios"
                              id="formHorizontalRadios2"
                              value='250000'
                              checked={rate === '250000'}
                              onChange={handleChangeCheck}
                         />
                         <Form.Check
                              type="radio"
                              label="500 kbps"
                              name="radios"
                              id="formHorizontalRadios3"
                              value='500000'
                              checked={rate === '500000'}
                              onChange={handleChangeCheck}
                         />
                         <Form.Check
                              type="radio"
                              label="1 Mbps"
                              name="radios"
                              id="formHorizontalRadios4"
                              value='1000000'
                              checked={rate === '1000000'}
                              onChange={handleChangeCheck}
                         />
                    </Col>
               </Form.Group>
               <hr />
               {statusMessage && (
                    <Alert variant={statusMessage.variant} className="mt-3" role="status" aria-live="polite">
                         {statusMessage.text}
                    </Alert>
               )}
               <div className='Buttons'>
                    <button className="continue" type="submit" disabled={isSubmitting}>
                         {isSubmitting ? (
                              <>
                                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                   <span className="ms-2">Connecting...</span>
                              </>
                         ) : (
                              'Confirm'
                         )}
                    </button>
                    <Link to="/" className="cancel"> Cancel </Link>
               </div>
          </Form>

     );
};
export default SelectCAN;