import { AnimatePresence } from "framer-motion"
import React from "react"
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom"
import Home from "../components/home-screen/Home"
import Navbar from "../components/nav-bar/Navbar"
import CANBusManager from "../components/canbus-manager/CANBusManager"
import Diagnostics from "../components/canbus-diagnostics/Diagnostics"
import Analyzer from "../components/canbus-analyzer/Analyzer"
import Playground from "../components/playground/Playground"
import AboutUs  from "../components/about/AboutUs"

 
function Animated() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location}
                key={location.pathname}>
                <Route exact path="/" 
                    element={<Home />}></Route>
                <Route exact path="/CANBusManager"
                    element={<CANBusManager />}></Route>
                <Route exact path="/Diagnostics"
                    element={<Diagnostics />}></Route>
                <Route exact path="/Analyzer"
                    element={<Analyzer />}></Route>
                <Route exact path="/Playground"
                    element={<Playground />}></Route>
                <Route exact path="/AboutUs"
                    element={<AboutUs />}></Route>
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
