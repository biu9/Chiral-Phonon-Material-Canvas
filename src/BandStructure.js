import {Component, memo} from "react";
import { Stage, Layer, Line, Group} from 'react-konva';

const BandType = {
    pam: 2,
    sxy: 3,
    syz: 4,
    szx: 5
}

class line {
    constructor(x1, y1, x2, y2, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
    }
    render() {
        return (
            <Line
                points={[this.x1, this.y1, this.x2, this.y2]}
                stroke={this.color}
                strokeWidth={1}
                key={this.x1.toString() + this.y1.toString() + this.x2.toString() + this.y2.toString()}
            />
        );
    }
}

class band {
    constructor(points) {
        this.lines = []
        for (let i = 1; i < points.length; i++) {
            let x1 = points[i-1][0];
            let y1 = points[i-1][1];
            let x2 = points[i][0];
            let y2 = points[i][1];
            this.lines.push(new line(x1, y1, x2, y2, points[i][2]));
        }
    }
    render() {
        // FIXME
        // random a key
        let key = Math.random().toString();
        return (
                <Group key={"Group of " + key}>
                    {
                        this.lines.map((line) => {
                            return line.render();
                        })
                    }
                </Group>
        );
    }
}

const Colors = {
    black: "black",
    red: "red",
    blue: "blue"
}

class BandStructure extends Component {
    constructor(props) {
        super(props);
        this.state = {
            width: props.width,
            height: props.height,
            bandType: props.bandType,
            data: props.data,
            stageScale: 1,
            stageX: 0,
            stageY: 0,
            processedData: []
        };
    }

    componentDidMount() {
        fetch('./data.txt')
            .then((r) => r.text())
            .then((text) => {
                this.setState({
                    data: text,
                });
                this.updateData();
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.data !== this.state.data) {
            this.updateData();
        }
    }

    updateData() {
        let lines = this.state.data.split('\n');
        let line_groups = [];
        lines.shift();
        let points = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(/\s+/);
            line = line.filter((item) => {
                return item !== '';
            });
            if (line.length < 2) {
                continue;
            }
            let x = parseFloat(line[0]);
            let y = parseFloat(line[1]);
            let color_depending = parseFloat(line[this.state.bandType]);
            if (color_depending > 1e-5) {
                points.push([x, y, Colors.red]);
            } else if (color_depending < -1e-5) {
                points.push([x, y, Colors.blue]);
            } else {
                points.push([x, y, Colors.black]);
            }
        }
        let xSlice = points.map((point) => {
            return point[0];
        });
        let ySlice = points.map((point) => {
            return point[1];
        });
        let xMax = Math.max(...xSlice);
        let xMin = Math.min(...xSlice);
        let yMax = Math.max(...ySlice);
        let yMin = Math.min(...ySlice);
        let xScale = this.state.width / (xMax - xMin);
        let yScale = this.state.height / (yMax - yMin);
        let x0 = -xMin * xScale;
        let y0 = yMax * yScale;

        points = points.map((point) => {
            return [point[0] * xScale + x0, - point[1] * yScale + y0, point[2]];
        });
        let group = [];
        let k = 0;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(/\s+/);
            line = line.filter((item) => {
                return item !== '';
            });
            if (line.length < 2) {
                line_groups.push(group);
                group = [];
            } else {
                group.push(points[k++]);
            }
        }
        if (group.length > 0) {
            line_groups.push(group);
        }

        line_groups = line_groups.filter((group) => {
            return group.length > 0;
        });

        let bands = line_groups.map((group) => {
            return new band(group);
        });
        console.log(bands);
        this.setState({
            processedData: bands,
        });
    }


    handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.02;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        this.setState({
            stageScale: newScale,
            stageX:
                -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            stageY:
                -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
        });
    };

    render() {
        const { width, height, stageScale, stageX, stageY, processedData } = this.state;

        return (
                <Stage
                    width={width}
                    height={height}
                    scaleX={stageScale}
                    scaleY={stageScale}
                    x={stageX}
                    y={stageY}
                    onWheel={this.handleWheel}
                    draggable
                >
                    <Layer>
                        <BandsRenderer data={processedData} />
                    </Layer>
                </Stage>
        );
    }
}

const BandsRenderer = memo(({ data }) => {
    console.log(data);
    return (
        <>
            {data.map((band) => {
                return band.render();
            })}
        </>
    );
});

export default BandStructure;