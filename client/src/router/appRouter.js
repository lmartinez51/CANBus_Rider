import { AnimatePresence } from "framer-motion";
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Home from "../components/home-screen/Home";
import Navbar from "../components/nav-bar/Navbar";
import CANBusManager from "../components/can-bus-manager/CANBusManager";

 
function Animated() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location}
                key={location.pathname}>
                <Route exact path="/" element={<Home />}></Route>
                <Route exact path="/CANBusManager"
                    element={<CANBusManager />}></Route>
            </Routes>
        </AnimatePresence>
    );
}

export default function AppRouter() {
    return (
        <div className="AppRouter">
            <>
            <Router>
                <Navbar />
                <Animated />
            </Router>
            </>
        </div>
    )
}
