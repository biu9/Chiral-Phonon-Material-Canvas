import {Component, memo} from "react";
import { Stage, Layer, Line, Group, Rect} from 'react-konva';

const BandType = {
    pam: 2,
    sxy: 3,
    syz: 4,
    szx: 5
}

class line {
    constructor(x1, y1, x2, y2, width, color) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.width = width;
        this.color = color;
    }
    render() {
        return (
            <Line
                points={[this.x1, this.y1, this.x2, this.y2]}
                stroke={this.color}
                strokeWidth={this.width}
                lineCap={"round"}
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
            let width = points[i][2];
            this.lines.push(new line(x1, y1, x2, y2, width, points[i][3]));
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
        let split_x:number[] = [];
        let cnt = 0;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].split(/\s+/);
            line = line.filter((item) => {
                return item !== '';
            });
            if(line.length < 2)
            {
                cnt = 0;
                continue;
            }
            ++cnt;
            let x = parseFloat(line[0]);
            let y = parseFloat(line[1]);
            let chirality = parseFloat(line[this.state.bandType]);
            if (cnt % 40 === 0) {
                split_x.push(x);
            }
            let color = 'black';
            if(chirality > 1e-5) {
                color = 'red';
            } else if(chirality < -1e-5) {
                color = 'blue';
            } else {
                chirality = 0.2;
            }
            points.push([x, y, Math.min(Math.max(chirality * 5, 0.5), 2), color]);
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
        let xn = xMax * xScale;
        yScale *= 0.9;
        let y0 = yMax * yScale;
        xScale *= 0.9;

        points = points.map(point =>  [ (point[0] - xMax) * xScale + xn, -point[1] * yScale + y0, point[2], point[3]]);

        split_x = split_x.map(x => - x * xScale + xn);
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


        let bands = [];
        // for each x in split_x, add a vertical line
        for(let i=0;i<split_x.length;i++) {
            const x = split_x[i];
            let point_up = [x, 0, 0.1, 'rgb(233,233,233)'];
            let point_down = [x, this.state.height, 0.1, 'rgb(233,233,233)'];
            bands.push(new band([point_up,point_down]));
        }
        bands = bands.concat(line_groups.map((group) => new band(group)));
        console.log(bands);
        this.setState({
            processedData: bands,
        });
    }


    handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.2;
        const stage = e.target.getStage();
        const layer = stage.children[0];
        const oldScale = layer.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - layer.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - layer.y() / oldScale
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
            <div>
                <Stage
                    width={width}
                    height={height}
                    onWheel={this.handleWheel}
                >
                    <Layer
                        draggable
                        x={stageX}
                        y={stageY}
                        scaleX={stageScale}
                        scaleY={stageScale}>
                        <BandsRenderer data={processedData} />
                    {/*    add a transparent rect to improve the performance of dragging*/}

                        <Rect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            fill={"transparent"}
                        />
                    </Layer>
                {/*    plot axis*/}
                    <Layer>
                        <Line
                            points={[0, height, width, height]}
                            stroke={"black"}
                            strokeWidth={1}
                        />
                        <Line
                            points={[0, 0, 0, height]}
                            stroke={"black"}
                            strokeWidth={1}
                        />
                    </Layer>
                </Stage>
            </div>
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