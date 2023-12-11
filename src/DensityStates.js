import {ChemDoodle} from "./ChemDoodleWeb";
import {useEffect} from "react";
import { useRef } from 'react';

function LatticeStructure(props) {
        let ref = useRef();
        useEffect(() => {
                let canvas = ref.current;
                let canvas_id = canvas.id;
                let seekerPlot = new ChemDoodle.SeekerCanvas('seekerPlot', 500, 200, ChemDoodle.SeekerCanvas.SEEK_PLOT);
                seekerPlot.styles.plots_showYAxis = true;
                seekerPlot.styles.plots_showXAxis = true;
                seekerPlot.styles.plots_flipXAxis = true;
                seekerPlot.styles.plots_flipYAxis = true;
            }
        )
        return (
            <canvas
                ref={ref}
                id="transformBallAndStick" style={{width: props.width, height: props.height}}></canvas>
        );
}

export default LatticeStructure;
