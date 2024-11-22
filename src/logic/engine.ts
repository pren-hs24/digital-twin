export interface IDriveListener {
    navigateToPoint: (point: string) => void | Promise<void>;
    takeExit: (
        from: string | null,
        on: string,
        to: string,
    ) => void | Promise<void>;

    selectTarget?: (target: string) => void | Promise<void>;
    start?: (path: string[]) => void | Promise<void>;
    emergencyStop?: () => void | Promise<void>;
    scanGraph?: () => void | Promise<void>;
    findPath?: () => void | Promise<void>;
    arriveAtDestination?: () => void | Promise<void>;
    closeToObstacle?: () => void | Promise<void>;
    obstacleCleared?: () => void | Promise<void>;
    exitTaken?: () => void | Promise<void>;
    navigatedToPoint?: () => void | Promise<void>;
}

export interface IDriveSensor {
    addOnObstacleListener: (callback: () => void) => void;
    addOnObstacleClearedListener: (callback: () => void) => void;
    addOnTargetReachedListener: (callback: () => void) => void;
    addOnTurnCompletedListener: (callback: () => void) => void;

    removeOnObstacleListener: (callback: () => void) => void;
    removeOnObstacleClearedListener: (callback: () => void) => void;
    removeOnTargetReachedListener: (callback: () => void) => void;
    removeOnTurnCompletedListener: (callback: () => void) => void;
}

export class DriveSensor implements IDriveSensor {
    private onObstacleCallbacks: (() => void)[] = [];
    private onObstacleClearedCallbacks: (() => void)[] = [];
    private onTargetReachedCallbacks: (() => void)[] = [];
    private onTurnCompletedCallbacks: (() => void)[] = [];

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
    }
    private deinitSensor(sensor: IDriveSensor) {
        sensor.removeOnObstacleListener(this.onObstacle);
        sensor.removeOnObstacleClearedListener(this.onObstacleCleared);
        sensor.removeOnTargetReachedListener(this.onTargetReached);
        sensor.removeOnTurnCompletedListener(this.onTurnCompleted);
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
}

export const waitFor = async (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const drive = async (options: {
    path: string[];
    sensors: SensorManager;
    actors: ListenerManager;
}) => {
    const { path, sensors, actors } = options;

    sensors.addOnObstacleListener(() => {
        actors.call("closeToObstacle");
    });
    sensors.addOnObstacleClearedListener(() => {
        actors.call("obstacleCleared");
    });

    await actors.call("selectTarget", path[path.length - 1]);
    await actors.call("start", path);
    await actors.call("scanGraph");
    await waitFor(1500);
    await actors.call("findPath");

    await actors.call("navigateToPoint", path[0]);
    await sensors.waitForTargetReached();
    await actors.call("navigatedToPoint");

    await actors.call("takeExit", null, path[0], path[1]);
    await sensors.waitForTurnCompleted();
    await actors.call("exitTaken");

    for (let i = 1; i < path.length - 1; i++) {
        await actors.call("navigateToPoint", path[i]);
        await sensors.waitForTargetReached();
        await actors.call("navigatedToPoint");

        await actors.call("takeExit", path[i - 1], path[i], path[i + 1]);
        await sensors.waitForTurnCompleted();
        await actors.call("exitTaken");
    }

    await actors.call("navigateToPoint", path[path.length - 1]);
    await sensors.waitForTargetReached();
    await actors.call("navigatedToPoint");

    await actors.call("arriveAtDestination");
};
