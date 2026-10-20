import React from "react"
import { Link } from "react-router-dom"
import logo from "./images/CanBus.png"
import "./Navbar.css"

const Navbar = () => {
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-light"
        aria-label="Main navigation">
        <div className="container-fluid">
          <a className="navbar-brand" href="/" aria-label="CAN Bus Rider home">
            <img src={logo} alt="" width={30} height={30} className="d-inline-block align-top "/>
             CAN Bus Rider
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav d-flex bd-highlight">
              <li className="nav-item p-2 bd-highlight">
                <Link className="nav-link" to="/ProjectConfigurationHolder">
                  Create Project
                </Link>
              </li>
              <li className="nav-item p-2 bd-highlight">
                <Link className="nav-link" to="/OpenProject">
                  Open Project
                </Link>
              </li>
              <li className="nav-item p-2 bd-highlight">
                <Link className="nav-link" to="/CANBusManager">
                  CAN Bus Manager
                </Link>
              </li>
              <li className="nav-item p-2 bd-highlight">
                <Link className="nav-link" to="/SplitView">
                  CAN Map Visualizer
                </Link>
              </li>
              <li className="nav-item p-2 bd-highlight">
                <Link className="nav-link" to="/Playground">
                  Playground
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar