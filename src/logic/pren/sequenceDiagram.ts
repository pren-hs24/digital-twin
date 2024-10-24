import { type IDriveListener } from "../engine";
import { getRoundaboutExit } from "./graph";

export class SequenceDiagram implements IDriveListener {
    private mermaidCode: string;

    onSync: ((mermaidCode: string) => void) | null = null;

    constructor() {
        this.mermaidCode = "";
        this.reset();
    }

    reset() {
        this.mermaidCode = `sequenceDiagram
    actor User
    participant Car
    participant Engine as Simulator
    participant ImageRecognition as Image Recognition
    participant Pathfinding
`;
        this.sync();
    }

    sync() {
        this.onSync?.(this.mermaidCode);
    }

    selectTarget(target: string) {
        this.mermaidCode += `    User->>+Car: Select target ${target}\n`;
        this.mermaidCode += `    Car->>-Engine: Select target ${target}\n`;
        this.sync();
    }

    start() {
        this.mermaidCode += `    User->>+Car: Start\n`;
        this.mermaidCode += `    Car->>-Engine: Start\n`;
        this.sync();
    }

    emergencyStop() {
        this.mermaidCode += `    User->>Car: Emergency stop\n`;
        this.mermaidCode += `    Car-xEngine: Emergency stop\n`;
        this.sync();
    }

    scanGraph() {
        this.mermaidCode += `    Engine->>+ImageRecognition: Scan graph\n`;
        this.mermaidCode += `    ImageRecognition-->>-Engine: Graph scanned\n`;
        this.sync();
    }

    findPath() {
        this.mermaidCode += `    Engine->>+Pathfinding: Find path\n`;
        this.mermaidCode += `    Pathfinding-->>-Engine: Path found\n`;
        this.sync();
    }

    navigateToPoint(point: string) {
        this.mermaidCode += `    Engine->>+Car: Navigate to ${point}\n`;
        this.sync();
    }

    takeExit(from: string | null, on: string, to: string) {
        const exit = getRoundaboutExit(from, on, to);
        this.mermaidCode += `    Engine->>+Car: Take exit ${exit}\n`;
        this.sync();
    }

    arriveAtDestination() {
        this.mermaidCode += `    Engine->>+Car: Arrive at destination\n`;
        this.mermaidCode += `    Car-->>-User: Visual feedback\n`;
        this.sync();
    }

    exitTaken() {
        this.mermaidCode += `    Car-->>-Engine: Exit taken\n`;
        this.sync();
    }

    navigatedToPoint() {
        this.mermaidCode += `    Car-->>-Engine: Arrived\n`;
        this.sync();
    }

    closeToObstacle() {
        this.mermaidCode += `    Car->>+ObstacleClearer: Report obstacle\n`;
        this.sync();
    }

    obstacleCleared() {
        this.mermaidCode += `    ObstacleClearer-->>-Car: Obstacle cleared\n`;
        this.sync();
    }
}
