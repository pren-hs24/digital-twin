import Konva from "konva";
import { Graph } from "./graph";
import {
    CLEAR_OBSTACLE_PENALTY_WEIGHT,
    COLOUR,
    SPEED_M_PER_S,
} from "../pren/constants";
import JSConfetti from "js-confetti";
import { DriveSensor, type IDriveListener } from "../engine";
import { computed, ref } from "vue";

const jsConfetti = new JSConfetti();

const PATH =
    "M448.5,49.5l701,0l0,101c-89.33,-0.167 -178.667,0 -268,0.5c21.642,55.732 36.809,113.232 45.5,172.5c3.894,24.591 7.227,49.258 10,74c37.094,0.996 74.26,1.33 111.5,1c-0.33,-49.905 0,-99.738 1,-149.5c83.33,-0.5 166.67,-0.667 250,-0.5l0,402c-83.33,0.167 -166.67,0 -250,-0.5c-1,-49.762 -1.33,-99.595 -1,-149.5l-102,0c0.985,27.4 2.152,54.733 3.5,82c50.05,65.717 99.72,131.717 149,198c1.36,48.66 1.69,97.327 1,146c-49.09,34.253 -98.59,67.92 -148.5,101c-1,40.33 -1.333,80.66 -1,121l99,0l0,-150l250,0l0,402l-99,0l0,149l-801,0l0,-149l-100,0l0,-402c83.334,-0.167 166.667,0 250,0.5c0.997,49.76 1.331,99.59 1,149.5l99,0c0.167,-40 0,-80 -0.5,-120c-50.013,-33.172 -99.679,-66.838 -149,-101c-0.167,-24.5 -0.333,-49 -0.5,-73.5c-0.158,-25.252 0.342,-50.419 1.5,-75.5c49.577,-65.488 98.91,-131.154 148,-197c0.367,-27.024 1.2,-54.024 2.5,-81l-102,0l0,150l-250,0l0,-402l250,0l0,150c37.239,0.33 74.406,-0.004 111.5,-1c6.844,-68.218 19.844,-135.218 39,-201c5.092,-15.344 10.592,-30.51 16.5,-45.5c-89,-0.333 -178,-0.667 -267,-1c-0.996,-33.427 -1.329,-66.927 -1,-100.5Zm350,179c-16.905,56.687 -29.405,114.354 -37.5,173c-8.369,71.751 -12.369,143.751 -12,216c-48.756,65.845 -97.756,131.512 -147,197c-1.907,2.109 -2.74,4.609 -2.5,7.5c0.6,16.498 1.267,32.998 2,49.5c49.911,33.08 99.411,66.747 148.5,101c0.5,108.67 0.667,217.33 0.5,326l99,0c-0.167,-109 0,-218 0.5,-327c49.321,-34.162 98.987,-67.828 149,-101c0.667,-17.667 0.667,-35.333 0,-53c-50.385,-66.718 -100.385,-133.718 -150,-201c-0.277,-37.686 -1.277,-75.353 -3,-113c-3.761,-93.902 -19.594,-185.569 -47.5,-275Zm-1,474c27.416,1.604 44.582,15.604 51.5,42c0.927,51.665 1.26,103.332 1,155c-33.427,0.996 -66.927,1.329 -100.5,1c-0.167,-52.001 0,-104.001 0.5,-156c6.034,-25.206 21.867,-39.206 47.5,-42Zm-397,398l0,198l49,0l0,-198l-49,0Zm750,0l0,198l49,0l0,-198l-49,0Zm-751,-750l0,198l49,0l0,-198l-49,0Zm750,0l0,198l49,0l0,-198l-49,0Zm-199,900l0,48l99,0l0,-48l-99,0Zm-450,150l0,48l599,0l0,-48l-599,0Zm50,-150l0,48l99,0l0,-48l-99,0Z";

const SCALE = 0.02;
const OFFSET = -15;

const CAR_DIRECTION = {
    UP: 0,
    RIGHT: 90,
    DOWN: 180,
    LEFT: 270,
};

const car = new Konva.Group({
    x: 0,
    y: 0,
    rotation: 180,
}).add(
    new Konva.Path({
        x: OFFSET,
        y: OFFSET,
        data: PATH,
        fill: COLOUR.ACCENT,
        scale: { x: SCALE, y: SCALE },
    }),
);

let carAdded = false;

const addCars = (stage: Konva.Stage) => {
    if (carAdded) return;

    const layer = new Konva.Layer();
    stage.add(layer);
    layer.add(car);
    stage.draw();
    carAdded = true;
};

export type Point = { x: number; y: number };

const angle = (from: Point, to: Point) => {
    const B = from;
    const C = to;

    const dx = C.x - B.x;
    const dy = -1 * (C.y - B.y);
    const mbc = dy / dx;

    if (dx == 0) {
        const rad = dy > 0 ? 0 : Math.PI;
        return { rad, deg: (rad * 180) / Math.PI };
    }
    if (dy == 0) {
        const rad = dx > 0 ? Math.PI / 2 : (3 * Math.PI) / 2;
        return { rad, deg: (rad * 180) / Math.PI };
    }

    const radbc = Math.atan(Math.abs(mbc));
    let rad = Infinity;

    if (dx > 0 && dy < 0) {
        rad = Math.PI / 2 + radbc;
    } else if (dx > 0 && dy > 0) {
        rad = Math.PI / 2 - radbc;
    } else if (dx < 0 && dy > 0) {
        rad = (3 * Math.PI) / 2 + Math.atan(Math.abs(mbc));
    } else {
        rad = (3 * Math.PI) / 2 - radbc;
    }
    const deg = (rad * 180) / Math.PI;

    return { rad, deg };
};

const degToDuration = (deg: number) => {
    deg = deg % 360;

    // 360 deg = 1s
    return (Math.abs(deg) / 360) * 1;
};

const optimiseCurrentDegree = (deg: number, current: number) => {
    // current could be 0 and deg could be 340, so we need to add 360 to current
    const diff = Math.abs(deg - current);
    const diffPlus360 = Math.abs(deg - (current + 360));
    const diffMinus360 = Math.abs(deg - (current - 360));

    if (diff < diffPlus360) {
        if (diff < diffMinus360) {
            return current;
        } else {
            return current - 360;
        }
    } else {
        if (diffPlus360 < diffMinus360) {
            return current + 360;
        } else {
            return current - 360;
        }
    }
};

const setCarColour = (colour: string) => {
    car.children.map((x) => (x as Konva.Shape).fill(colour));
};

export const prepareDrive = (graph: Graph) => {
    const stage = graph.stage;
    const sensor = new DriveSensor();
    const path = ref<string[]>([]);
    const nodes = computed(() => path.value.map((node) => graph.getNode(node)));

    const moveToNextNode = (i: number = 1) => {
        if (i == 0) {
            const node = path.value[i];
            const shape = graph.getNode(node);

            const targetX = shape.x;
            const targetY = shape.y;

            return new Promise<void>((resolve) => {
                const onTargetReached = () => {
                    sensor.targetReached();
                    resolve();
                };

                const tween = new Konva.Tween({
                    node: car,
                    x: targetX,
                    y: targetY,
                    duration: 0.5 / SPEED_M_PER_S,
                    onFinish: onTargetReached,
                });
                tween.play();
            });
        }

        if (i >= nodes.value.length) return;

        const prevNode = path.value[i - 1];
        const node = path.value[i];
        const edge = graph.weightedGraph.getEdge(prevNode, node);
        const distance = edge.weight;
        const duration = distance / SPEED_M_PER_S;

        const prevShape = graph.getNode(prevNode);
        const shape = graph.getNode(node);

        let targetX = shape.x;
        let targetY = shape.y;

        return new Promise<void>((resolve) => {
            const onTargetReached = () => {
                sensor.targetReached();
                resolve();
            };

            let onFinish = onTargetReached;

            if (edge.obstructed) {
                targetX = (prevShape.x + shape.x) / 2;
                targetY = (prevShape.y + shape.y) / 2;

                onFinish = () => {
                    setCarColour(COLOUR.YELLOW);
                    sensor.obstacle();

                    setTimeout(() => {
                        setCarColour(COLOUR.ACCENT);
                        sensor.obstacleCleared();

                        const tween = new Konva.Tween({
                            node: car,
                            x: shape.x,
                            y: shape.y,
                            duration: duration,
                            onFinish: () => {
                                resolve();
                                onTargetReached();
                            },
                        });
                        tween.play();
                    }, CLEAR_OBSTACLE_PENALTY_WEIGHT * 1000);
                };
            }

            const tween = new Konva.Tween({
                node: car,
                x: targetX,
                y: targetY,
                duration: duration,
                onFinish: onFinish,
            });
            tween.play();
        });
    };

    const rotateToNextNode = (i: number = 0) => {
        if (i == -1) {
            const initialAngle = angle(
                { x: nodes.value[0].x, y: nodes.value[0].y },
                { x: nodes.value[1].x, y: nodes.value[1].y },
            ).deg;

            return new Promise<void>((resolve) => {
                const tween = new Konva.Tween({
                    node: car,
                    rotation: initialAngle,
                    duration: degToDuration(initialAngle - car.rotation()),
                    onFinish: () => {
                        console.log("initial rotation done", sensor);
                        sensor.turnCompleted();
                        resolve();
                    },
                });
                tween.play();
            });
        }

        const node = path.value[i];
        const nextNode = path.value[i + 1];

        const shape = graph.getNode(node);
        const nextShape = graph.getNode(nextNode);

        const { deg } = angle(
            { x: shape.x, y: shape.y },
            { x: nextShape.x, y: nextShape.y },
        );

        car.rotation(optimiseCurrentDegree(deg, car.rotation()));
        const duration = degToDuration(deg - car.rotation());

        return new Promise<void>((resolve) => {
            const tween = new Konva.Tween({
                node: car,
                rotation: deg,
                duration: duration,
                onFinish: () => {
                    sensor.turnCompleted();
                    resolve();
                },
            });
            tween.play();
        });
    };

    const start = (newPath: string[]) => {
        path.value = newPath;
        position = 0;

        if (!path.value.length) {
            car.hide();
            return {
                sensor: null,
                listener: null,
            };
        } else {
            car.show();
        }

        addCars(stage);

        // move the car to the first node
        car.x(nodes.value[0].x);
        car.y(20);
        car.rotation(CAR_DIRECTION.DOWN);
    };

    let position = 0;

    const getIndexFromNode = (node: string) => {
        const targetIndex = position + path.value.slice(position).indexOf(node);
        position = targetIndex;
        return targetIndex;
    };

    return {
        sensor,
        listener: {
            start,
            navigateToPoint: (target: string) => {
                return moveToNextNode(getIndexFromNode(target));
            },
            takeExit: (from: string | null, on: string) => {
                if (from == null) {
                    return rotateToNextNode(-1);
                }

                return rotateToNextNode(getIndexFromNode(on));
            },
            arriveAtDestination: () => {
                jsConfetti.addConfetti();
            },
        } as IDriveListener,
    };
};
