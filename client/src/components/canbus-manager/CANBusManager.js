import React from 'react'
import Transitions from '../Transitions';
import './CANBusManager.css'
import { Row, Col, Tabs, Tab } from "react-bootstrap";
import SelectVirtualCAN from './SelectVirtualCANBus';
import SelectCAN from "./SelectCANBus";

const CANBusManager = () => {
    return (
        <>
        <Transitions>
          <div className="managerContainer">
               <div className='interfaces'>
                    <h3 className='text'>CAN Bus Manager</h3>
                    <Row className="card">
                         <Col className="mx-auto">
                              <h2 className="menu">
                                   CAN Bus Menu
                              </h2>
                              <hr />
                              <Tabs className='tabs' defaultActiveKey="select" id="tab">
                                   <Tab eventKey="select" title="CAN Bus">
                                        <SelectCAN />
                                   </Tab>
                                   <Tab eventKey="virtual" title="Virtual CAN Bus">
                                        <SelectVirtualCAN />
                                   </Tab>
                              </Tabs>
                         </Col>
                    </Row>
               </div>
          </div>
        </Transitions>
        </>
    )
}

export default CANBusManager