import { useNavigatorStore } from "@/stores/navigator";
import type { WeightedGraph } from "./graph";

export interface IDriveListener {
    navigateToPoint: (point: string) => void | Promise<void>;
    takeExit: (
        from: string | null,
        on: string,
        to: string,
    ) => void | Promise<void>;

    selectTarget?: (target: string) => void | Promise<void>;
    start?: () => void | Promise<void>;
    emergencyStop?: () => void | Promise<void>;
    scanGraph?: () => void | Promise<void>;
    findPath?: (
        graph: WeightedGraph,
        start: string,
        target: string,
    ) => void | Promise<void>;
    foundPath?: (path: string[]) => void | Promise<void>;
    arriveAtDestination?: () => void | Promise<void>;
    closeToObstacle?: () => void | Promise<void>;
    obstacleCleared?: () => void | Promise<void>;
    exitTaken?: () => void | Promise<void>;
    navigatedToPoint?: () => void | Promise<void>;
    nextNodeBlocked?: (node: string) => void | Promise<void>;
    nextEdgeBlocked?: (nodeA: string, nodeB: string) => void | Promise<void>;
}

export interface IDriveSensor {
    addOnObstacleListener: (callback: () => void) => void;
    addOnObstacleClearedListener: (callback: () => void) => void;
    addOnTargetReachedListener: (callback: () => void) => void;
    addOnTurnCompletedListener: (callback: () => void) => void;
    addOnPathFoundListener: (callback: (path: string[]) => void) => void;

    removeOnObstacleListener: (callback: () => void) => void;
    removeOnObstacleClearedListener: (callback: () => void) => void;
    removeOnTargetReachedListener: (callback: () => void) => void;
    removeOnTurnCompletedListener: (callback: () => void) => void;
    removeOnPathFoundListener: (callback: (path: string[]) => void) => void;
}

export class DriveSensor implements IDriveSensor {
    private onObstacleCallbacks: (() => void)[] = [];
    private onObstacleClearedCallbacks: (() => void)[] = [];
    private onTargetReachedCallbacks: (() => void)[] = [];
    private onTurnCompletedCallbacks: (() => void)[] = [];
    private onPathFoundCallbacks: ((path: string[]) => void)[] = [];

    addOnObstacleListener(callback: () => void) {
        this.onObstacleCallbacks.push(callback);
    }
    addOnObstacleClearedListener(callback: () => void) {
        this.onObstacleClearedCallbacks.push(callback);
    }
    addOnTargetReachedListener(callback: () => void) {
        this.onTargetReachedCallbacks.push(callback);
    }
    addOnTurnCompletedListener(callback: () => void) {
        this.onTurnCompletedCallbacks.push(callback);
    }
    addOnPathFoundListener(callback: (path: string[]) => void) {
        this.onPathFoundCallbacks.push(callback);
    }

    removeOnObstacleListener(callback: () => void) {
        const index = this.onObstacleCallbacks.indexOf(callback);
        if (index === -1) return;

        this.onObstacleCallbacks.splice(index, 1);
    }
    removeOnObstacleClearedListener(callback: () => void) {
        const index = this.onObstacleClearedCallbacks.indexOf(callback);
        if (index === -1) return;

        this.onObstacleClearedCallbacks.splice(index, 1);
    }
    removeOnTargetReachedListener(callback: () => void) {
        const index = this.onTargetReachedCallbacks.indexOf(callback);
        if (index === -1) return;

        this.onTargetReachedCallbacks.splice(index, 1);
    }
    removeOnTurnCompletedListener(callback: () => void) {
        const index = this.onTurnCompletedCallbacks.indexOf(callback);
        if (index === -1) return;

        this.onTurnCompletedCallbacks.splice(index, 1);
    }
    removeOnPathFoundListener(callback: (path: string[]) => void) {
        const index = this.onPathFoundCallbacks.indexOf(callback);
        if (index === -1) return;

        this.onPathFoundCallbacks.splice(index, 1);
    }

    obstacle() {
        this.onObstacleCallbacks.forEach((callback) => callback());
    }
    obstacleCleared() {
        this.onObstacleClearedCallbacks.forEach((callback) => callback());
    }
    targetReached() {
        this.onTargetReachedCallbacks.forEach((callback) => callback());
    }
    turnCompleted() {
        this.onTurnCompletedCallbacks.forEach((callback) => callback());
    }
    pathFound(path: string[]) {
        this.onPathFoundCallbacks.forEach((callback) => callback(path));
    }
}

export class ListenerManager {
    private listeners: IDriveListener[];

    constructor(listeners: IDriveListener[]) {
        this.listeners = listeners;
    }

    addListener(listener: IDriveListener) {
        this.listeners.push(listener);
    }

    removeListener(listener: IDriveListener) {
        const i = this.listeners.indexOf(listener);
        if (i == -1) return;
        this.listeners.splice(i, 1);
    }

    async call<T extends keyof IDriveListener>(
        method: T,
        ...args: Parameters<NonNullable<IDriveListener[T]>>
    ) {
        await Promise.all(
            this.listeners
                .filter((listener) => listener[method] !== undefined)
                .map((listener) => {
                    const func = listener[method];
                    if (func) {
                        return (func as (...args: unknown[]) => unknown).bind(
                            listener,
                        )(...args);
                    }
                }),
        );
    }
}

export const DriveConsoleLogger: IDriveListener = {
    navigateToPoint: async (point: string) => {
        console.log(`Navigating to ${point}`);
    },
    takeExit: async (from: string | null, on: string, to: string) => {
        console.log(`Taking exit from ${from} on ${on} to ${to}`);
    },
    selectTarget: async (target: string) => {
        console.log(`Selecting target ${target}`);
    },
    start: async () => {
        console.log(`Starting`);
    },
    emergencyStop: async () => {
        console.log(`Emergency stop`);
    },
    scanGraph: async () => {
        console.log(`Scanning graph`);
    },
    findPath: async () => {
        console.log(`Finding path`);
    },
    foundPath: async (path: string[]) => {
        console.log(`Found path: ${path.join(" -> ")}`);
    },
    arriveAtDestination: async () => {
        console.log(`Arrived at destination`);
    },
    closeToObstacle: async () => {
        console.log(`Close to obstacle`);
    },
    obstacleCleared: async () => {
        console.log(`Obstacle cleared`);
    },
    exitTaken: async () => {
        console.log(`Exit taken`);
    },
    navigatedToPoint: async () => {
        console.log(`Arrived`);
    },
};

interface Future {
    alreadyResolved: boolean;
    resolve: (() => void) | null;
}

export class SensorManager extends DriveSensor {
    private sensors: IDriveSensor[];

    private obstacleFuture: Future | null = null;
    private obstacleClearedFuture: Future | null = null;
    private targetReachedFuture: Future | null = null;
    private turnCompletedFuture: Future | null = null;
    private pathFoundFuture: Future | null = null;

    constructor(sensors: IDriveSensor[]) {
        super();

        this.sensors = sensors;

        this.sensors.forEach((sensor) => this.initSensor(sensor));
    }

    private initSensor(sensor: IDriveSensor) {
        sensor.addOnObstacleListener(this.onObstacle);
        sensor.addOnObstacleClearedListener(this.onObstacleCleared);
        sensor.addOnTargetReachedListener(this.onTargetReached);
        sensor.addOnTurnCompletedListener(this.onTurnCompleted);
        sensor.addOnPathFoundListener(this.onPathFound);
    }
    private deinitSensor(sensor: IDriveSensor) {
        sensor.removeOnObstacleListener(this.onObstacle);
        sensor.removeOnObstacleClearedListener(this.onObstacleCleared);
        sensor.removeOnTargetReachedListener(this.onTargetReached);
        sensor.removeOnTurnCompletedListener(this.onTurnCompleted);
        sensor.removeOnPathFoundListener(this.onPathFound);
    }

    private onObstacle = () => {
        this.obstacle();

        if (this.obstacleFuture) {
            this.obstacleFuture.resolve?.();
            this.obstacleFuture = null;
        } else {
            this.obstacleFuture = {
                alreadyResolved: true,
                resolve: null,
            };
        }
    };

    private onObstacleCleared = () => {
        this.obstacleCleared();

        if (this.obstacleClearedFuture) {
            this.obstacleClearedFuture.resolve?.();
            this.obstacleClearedFuture = null;
        } else {
            this.obstacleClearedFuture = {
                alreadyResolved: true,
                resolve: null,
            };
        }
    };

    private onTargetReached = () => {
        this.targetReached();

        if (this.targetReachedFuture) {
            this.targetReachedFuture.resolve?.();
            this.targetReachedFuture = null;
        } else {
            this.targetReachedFuture = {
                alreadyResolved: true,
                resolve: null,
            };
        }
    };

    private onTurnCompleted = () => {
        this.turnCompleted();

        if (this.turnCompletedFuture) {
            this.turnCompletedFuture.resolve?.();
            this.turnCompletedFuture = null;
        } else {
            this.turnCompletedFuture = {
                alreadyResolved: true,
                resolve: null,
            };
        }
    };

    private onPathFound = (path: string[]) => {
        this.pathFound(path);

        if (this.pathFoundFuture) {
            this.pathFoundFuture.resolve?.();
            this.pathFoundFuture = null;
        } else {
            this.pathFoundFuture = {
                alreadyResolved: true,
                resolve: null,
            };
        }
    };

    addSensor(sensor: IDriveSensor) {
        this.sensors.push(sensor);
        this.initSensor(sensor);
    }

    removeSensor(sensor: IDriveSensor) {
        const index = this.sensors.indexOf(sensor);
        if (index === -1) return;

        this.deinitSensor(sensor);
        this.sensors.splice(index, 1);
    }

    waitForObstacle() {
        if (this.obstacleFuture?.alreadyResolved) {
            this.obstacleFuture = null;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.obstacleFuture = {
                alreadyResolved: false,
                resolve,
            };
        });
    }

    waitForObstacleCleared() {
        if (this.obstacleClearedFuture?.alreadyResolved) {
            this.obstacleClearedFuture = null;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.obstacleClearedFuture = {
                alreadyResolved: false,
                resolve,
            };
        });
    }

    waitForTargetReached() {
        if (this.targetReachedFuture?.alreadyResolved) {
            this.targetReachedFuture = null;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.targetReachedFuture = {
                alreadyResolved: false,
                resolve,
            };
        });
    }

    waitForTurnCompleted() {
        if (this.turnCompletedFuture?.alreadyResolved) {
            this.turnCompletedFuture = null;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.turnCompletedFuture = {
                alreadyResolved: false,
                resolve,
            };
        });
    }

    waitForPathFound() {
        if (this.pathFoundFuture?.alreadyResolved) {
            this.pathFoundFuture = null;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.pathFoundFuture = {
                alreadyResolved: false,
                resolve,
            };
        });
    }
}

export const waitFor = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const createEngine = (sensors: SensorManager, actors: ListenerManager) => ({
    navigateToPoint: async (point: string) => {
        await actors.call("navigateToPoint", point);
        await sensors.waitForTargetReached();
        await actors.call("navigatedToPoint");
    },
    takeExit: async (from: string | null, on: string, to: string) => {
        await actors.call("takeExit", from, on, to);
        await sensors.waitForTurnCompleted();
        await actors.call("exitTaken");
    },
});

const oversight = async (options: {
    sensors: SensorManager;
    actors: ListenerManager;
    target: string;
}) => {
    const { target, sensors, actors } = options;
    const navigator = useNavigatorStore();
    const engine = createEngine(sensors, actors);

    const first = "START";
    navigator.path = [first, target];

    sensors.addOnObstacleListener(() => {
        actors.call("closeToObstacle");
    });
    sensors.addOnObstacleClearedListener(() => {
        actors.call("obstacleCleared");
    });
    sensors.addOnPathFoundListener((p) => {
        navigator.path = p;
    });

    await actors.call("selectTarget", target);
    await actors.call("start");
    await actors.call("scanGraph");
    await waitFor(1500);

    await actors.call("findPath", navigator.network, "START", target);

    await engine.navigateToPoint(first);

    await sensors.waitForPathFound();
    await actors.call("foundPath", navigator.path);

    await engine.takeExit(null, navigator.path[0], navigator.path[1]);

    for (let i = 1; i < navigator.path.length - 1; i++) {
        await engine.navigateToPoint(navigator.path[i]);

        await engine.takeExit(
            navigator.path[i - 1],
            navigator.path[i],
            navigator.path[i + 1],
        );
    }

    await engine.navigateToPoint(navigator.path[navigator.path.length - 1]);

    await actors.call("arriveAtDestination");
};

const roadsense = async (options: {
    sensors: SensorManager;
    actors: ListenerManager;
    target: string;
}) => {
    const { target, sensors, actors } = options;
    const navigator = useNavigatorStore();
    const actualGraph = navigator.network;
    const liveGraph = actualGraph.copy();
    const engine = createEngine(sensors, actors);

    const first = "START";
    navigator.path = [first, target];

    sensors.addOnObstacleListener(() => {
        actors.call("closeToObstacle");
    });
    sensors.addOnObstacleClearedListener(() => {
        actors.call("obstacleCleared");
    });
    sensors.addOnPathFoundListener((p) => {
        navigator.path = p;
    });

    await actors.call("selectTarget", target);
    await actors.call("start");
    await actors.call("scanGraph");
    await waitFor(1500);

    await actors.call("findPath", liveGraph, "START", target);

    await engine.navigateToPoint(first);

    await sensors.waitForPathFound();
    await actors.call("foundPath", navigator.path);

    const turnToFirst = async () => {
        await engine.takeExit(null, navigator.path[0], navigator.path[1]);
    };

    await turnToFirst();

    for (let i = 1; i < navigator.path.length; i++) {
        const onNode = navigator.path[i - 1];
        const nextNode = navigator.path[i];

        const recalculate = async () => {
            const pathFragment = navigator.path.slice(0, i - 1);
            navigator.additionalPathFragments.push(...pathFragment);
            await actors.call("findPath", liveGraph, onNode, target);
            await sensors.waitForPathFound();
            await actors.call("foundPath", navigator.path);
            i = 1;

            if (i == 1) {
                await turnToFirst();
            } else {
                await engine.takeExit(
                    navigator.path[i - 2],
                    navigator.path[i - 1],
                    navigator.path[i],
                );
            }

            i -= 1;
        };

        if (actualGraph.getEdge(onNode, nextNode)?.disabled) {
            liveGraph.getEdge(onNode, navigator.path[i])!.disabled = true;
            await actors.call("nextEdgeBlocked", onNode, nextNode);
            await recalculate();
            continue;
        } else if (actualGraph.disabledNodes.includes(navigator.path[i])) {
            liveGraph.disabledNodes.push(navigator.path[i]);
            await actors.call("nextNodeBlocked", navigator.path[i]);
            await recalculate();
            continue;
        }

        await engine.navigateToPoint(navigator.path[i]);

        if (i < navigator.path.length - 1) {
            await engine.takeExit(
                navigator.path[i - 1],
                navigator.path[i],
                navigator.path[i + 1],
            );
        }
    }

    await actors.call("arriveAtDestination");
};

export const drive = {
    oversight,
    roadsense,
};
