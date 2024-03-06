import "./Visualizer.css"
import Transitions from "../Transitions"
import { ReactComponent as Sentra } from "./assets/Sentra2014.svg"
import axios from 'axios'
//import DataTree from './DataTree';
import SimpleDiagram from './SimpleDiagram';

const canUrl = 'http://localhost:8080/can'

export default function Visualizer () {

    function handleCanButton() {
        axios.post(canUrl)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error al conectar al adaptador: ', error);
            });
    }

    return (
        <>
            <Transitions>
                <div className='Visualizer'>
                    <div className="map">
                        <div className="carMap">
                            <button className="connectButton" onClick={handleCanButton}>Connect</button>
                            <Sentra/>
                            <SimpleDiagram />
                        </div>
                    </div>
                </div>
            </Transitions>
        </>
    )
}