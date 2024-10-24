import { IDriveListener } from "./engine";

export class DriveLogger implements IDriveListener {
    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    private log(message: string) {
        const logMessage = `${new Date().toLocaleTimeString()}: ${message}`;

        const p = document.createElement("p");
        p.className = "log-entry";
        p.textContent = logMessage;
        this.element.appendChild(p);
    }

    clear() {
        this.element.innerHTML = "";
    }
    async navigateToPoint(point: string) {
        this.log(`Navigating to ${point}`);
    }
    async navigatedToPoint() {
        this.log(`Navigated to point`);
    }
    async takeExit(from: string | null, on: string, to: string) {
        this.log(`Taking exit from ${from} on ${on} to ${to}`);
    }
    async exitTaken() {
        this.log(`Exit taken`);
    }
    async selectTarget(target: string) {
        this.log(`Selecting target ${target}`);
    }
    async start() {
        this.log(`Starting`);
    }
    async emergencyStop() {
        this.log(`Emergency stop`);
    }
    async scanGraph() {
        this.log(`Scanning graph`);
    }
    async findPath() {
        this.log(`Finding path`);
    }
    async arriveAtDestination() {
        this.log(`Arrived at destination`);
    }
}
