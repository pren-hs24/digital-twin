export interface IDriveListener {
    navigateToPoint: (point: string) => void | Promise<void>;
    takeExit: (
        from: string | null,
        on: string,
        to: string
    ) => void | Promise<void>;

    selectTarget?: (target: string) => void | Promise<void>;
    start?: () => void | Promise<void>;
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
    onObstacle: (callback: () => void) => void;
    onObstacleCleared: (callback: () => void) => void;
    onTargetReached: (callback: () => void) => void;
    onTurnCompleted: (callback: () => void) => void;
}

export class DriveSensor {
    private onObstacleCallbacks: (() => void)[] = [];
    private onObstacleClearedCallbacks: (() => void)[] = [];
    private onTargetReachedCallbacks: (() => void)[] = [];
    private onTurnCompletedCallbacks: (() => void)[] = [];

    onObstacle(callback: () => void) {
        this.onObstacleCallbacks.push(callback);
    }
    onObstacleCleared(callback: () => void) {
        this.onObstacleClearedCallbacks.push(callback);
    }
    onTargetReached(callback: () => void) {
        this.onTargetReachedCallbacks.push(callback);
    }
    onTurnCompleted(callback: () => void) {
        this.onTurnCompletedCallbacks.push(callback);
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

class ListenerManager {
    private listeners: IDriveListener[];

    constructor(listeners: IDriveListener[]) {
        this.listeners = listeners;
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
                        return (func as (...args: any) => any).bind(listener)(
                            ...args
                        );
                    }
                })
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

class SensorManager extends DriveSensor {
    private sensors: IDriveSensor[];

    private obstacleFuture: Future | null = null;
    private obstacleClearedFuture: Future | null = null;
    private targetReachedFuture: Future | null = null;
    private turnCompletedFuture: Future | null = null;

    constructor(sensors: IDriveSensor[]) {
        super();

        this.sensors = sensors;

        this.sensors.forEach((sensor) => {
            sensor.onObstacle(() => {
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
            });
            sensor.onObstacleCleared(() => {
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
            });
            sensor.onTargetReached(() => {
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
            });
            sensor.onTurnCompleted(() => {
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
            });
        });
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

export const drive = async (options: {
    path: string[];
    sensors: IDriveSensor[];
    listeners: IDriveListener[];
}) => {
    const { path, sensors, listeners } = options;

    const manager = new ListenerManager(listeners);
    const sensorManager = new SensorManager(sensors);

    sensorManager.onObstacle(() => {
        manager.call("closeToObstacle");
    });
    sensorManager.onObstacleCleared(() => {
        manager.call("obstacleCleared");
    });

    await manager.call("selectTarget", path[path.length - 1]);
    await manager.call("start");
    await manager.call("scanGraph");
    await manager.call("findPath");

    await manager.call("takeExit", null, path[0], path[1]);
    await sensorManager.waitForTurnCompleted();
    await manager.call("exitTaken");

    for (let i = 1; i < path.length - 1; i++) {
        await manager.call("navigateToPoint", path[i]);
        await sensorManager.waitForTargetReached();
        await manager.call("navigatedToPoint");

        await manager.call("takeExit", path[i - 1], path[i], path[i + 1]);
        await sensorManager.waitForTurnCompleted();
        await manager.call("exitTaken");
    }

    await manager.call("navigateToPoint", path[path.length - 1]);
    await sensorManager.waitForTargetReached();
    await manager.call("navigatedToPoint");

    await manager.call("arriveAtDestination");
};
