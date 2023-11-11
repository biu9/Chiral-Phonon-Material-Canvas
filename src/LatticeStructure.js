import {ChemDoodle} from "./ChemDoodleWeb";
import {useEffect} from "react";
import { useRef } from 'react';



function LatticeStructure(props) {
        let ref = useRef();
        useEffect(() => {
                let canvas = ref.current;
                let canvas_id = canvas.id;
                let transformBallAndStick = new ChemDoodle.TransformCanvas3D(canvas_id, props.width, props.height);
                transformBallAndStick.styles.set3DRepresentation('Ball and Stick');
                transformBallAndStick.styles.backgroundColor = 'white';
                let molFile = props.molFile;
                let molecule = ChemDoodle.readMOL(molFile, 1);
                transformBallAndStick.loadMolecule(molecule);
                transformBallAndStick.repaint();
            }
        )
        return (
            <canvas
                ref={ref}
                id="transformBallAndStick" style={{width: props.width, height: props.height}}></canvas>
        );
}

export default LatticeStructure;