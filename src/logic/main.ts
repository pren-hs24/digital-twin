import "./style.css";
import { getStage } from "./konva";
import mermaid from "mermaid";
import { dijkstra, dijkstraWithWeightedNodes } from "./pathfinding";
import { type EdgeDefinition, Graph, Position } from "./konva/graph";
import { weightedGraph } from "./pren/graph";
import { SPEED_M_PER_S } from "./pren/constants";
import { prepareDrive } from "./konva/car";
import { SequenceDiagram } from "./pren/sequenceDiagram";
import { drive, DriveConsoleLogger } from "./engine";
import { DriveLogger } from "./logger";

console.log(`Speed: ${SPEED_M_PER_S} m/s (${SPEED_M_PER_S * 3.6} km/h)`);

const sequenceDiagramElement = document.querySelector(
    "#sequence-diagram",
) as HTMLElement;
const logElement = document.querySelector("#log") as HTMLElement;
const edgeSelection = document.querySelector(
    "#edge-selection",
) as HTMLInputElement;
const weight = document.querySelector("#weight") as HTMLInputElement;
const disabled = document.querySelector("#disabled") as HTMLInputElement;
const obstructed = document.querySelector("#obstructed") as HTMLInputElement;
const btnApplyToEdge = document.querySelector(
    "#apply-to-edge",
) as HTMLButtonElement;

const sequenceDiagram = new SequenceDiagram();
const logger = new DriveLogger(logElement);

sequenceDiagram.onSync = async (code) => {
    sequenceDiagramElement.innerHTML = "";
    sequenceDiagramElement.innerHTML = code;
    sequenceDiagramElement.removeAttribute("data-processed");
    await mermaid.run();
};

const graph = new Graph(getStage(new HTMLElement()), weightedGraph);
graph.setNodePosition("A", Position.MIN, Position.FOUR_FIFTH);
graph.setNodePosition("B", Position.CENTRE, Position.MAX);
graph.setNodePosition("C", Position.MAX, Position.FOUR_FIFTH);
graph.setNodePosition("W", Position.MIN, Position.TWO_FIFTH);
graph.setNodePosition("X", Position.FIFTH, Position.TWO_FIFTH);
graph.setNodePosition("Y", Position.CENTRE, Position.CENTRE);
graph.setNodePosition("Z", Position.MAX, Position.TWO_FIFTH);
graph.setNodePosition("START", Position.CENTRE, Position.MIN);

const navigatePath = (path: string[]) => {
    graph.markRoute(path);
    logger.clear();
    sequenceDiagram.reset();

    const { sensor: carSensor, listener: carDriver } = prepareDrive(
        graph.stage,
        path,
        graph,
    );

    if (!carDriver) {
        console.error("Failed to prepare drive");
        return;
    }

    const obstacles = weightedGraph.obstaclesInPath(path);
    (document.querySelector("#obstacle-count") as HTMLSpanElement).innerText =
        String(obstacles);

    const distance = weightedGraph.pathDistance(path);
    const time = Math.round((100 * distance) / SPEED_M_PER_S) / 100;
    (
        document.querySelector("#estimated-duration") as HTMLSpanElement
    ).innerText = time + "s";

    drive({
        path: path,
        sensors: [carSensor],
        listeners: [carDriver, sequenceDiagram, DriveConsoleLogger, logger],
    });
};

// @ts-ignore
window.navigateTo = (target: string) => {
    if (target === "START") {
        navigatePath([]);
        return;
    }

    const algorithms: any = {
        dijkstra,
        dijkstraWithWeightedNodes,
    };

    const selection: string = (window as any).algorithm || "dijkstra";
    const algorithm = algorithms?.[selection] || dijkstra;

    console.log(`Using algorithm: ${selection}`);

    const path = algorithm({
        graph: weightedGraph,
        from: "START",
        to: target,
    });

    navigatePath(path);
};

// @ts-ignore
window.traverseAllEdges = () => {
    const path = [] as string[];

    path.push("START");
    path.push("W");
    path.push("A");
    path.push("B");
    path.push("C");
    path.push("Z");
    path.push("START");
    path.push("X");
    path.push("W");
    path.push("A");
    path.push("X");
    path.push("Y");
    path.push("Z");
    path.push("X");
    path.push("Y");
    path.push("C");
    path.push("B");
    path.push("Y");
    path.push("A");

    navigatePath(path);
};

graph.onToggleNode = (node) => {
    weightedGraph.toggleNode(node.name);
};

let selectedEdges: EdgeDefinition[] = [];
graph.onSelectEdge = (edge, selected) => {
    if (selected && !selectedEdges.includes(edge)) {
        selectedEdges.push(edge);
    } else {
        selectedEdges = selectedEdges.filter((e) => e !== edge);
    }

    disabled.disabled = !edge;
    obstructed.disabled = !edge;
    weight.disabled = !edge;
    btnApplyToEdge.disabled = !edge;

    if (selectedEdges.length === 0) {
        edgeSelection.innerText = "Select a path to edit";
    } else {
        const currentState = weightedGraph.getEdge(edge.nodeA, edge.nodeB);

        const paths = selectedEdges.map(
            (edge) => `${edge.nodeA} -> ${edge.nodeB}`,
        );
        const label = paths.length > 1 ? "Editing paths:" : "Editing path:";
        let pathString = paths.join(", ");
        if (paths.length > 3) {
            pathString =
                paths.slice(0, 2).join(", ") + ` (+${paths.length - 2})`;
        }

        edgeSelection.innerText = `${label} ${pathString}`;
        disabled.checked = currentState.disabled;
        obstructed.checked = currentState.obstructed;
        weight.value = String(currentState.weight);
    }
};

btnApplyToEdge.onclick = () => {
    selectedEdges.forEach((edge) => {
        weightedGraph.updateEdge(
            edge.nodeA,
            edge.nodeB,
            Number(weight.value),
            obstructed.checked,
            disabled.checked,
        );
        graph.updateEdge(edge);
    });
};

mermaid.initialize({
    startOnLoad: true,
});
