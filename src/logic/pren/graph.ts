import Konva from "konva";
import { WeightedGraph } from "../graph";
import { Graph, Position } from "../konva/graph";
export const weightedGraph = new WeightedGraph();

weightedGraph.addNode("A");
weightedGraph.addNode("B");
weightedGraph.addNode("C");
weightedGraph.addNode("W");
weightedGraph.addNode("X");
weightedGraph.addNode("Y");
weightedGraph.addNode("Z");
weightedGraph.addNode("START");

weightedGraph.addEdge("A", "B", 2);
weightedGraph.addEdge("A", "W", 2);
weightedGraph.addEdge("A", "X", 2);
weightedGraph.addEdge("A", "Y", 1.5);
weightedGraph.addEdge("B", "Y", 1.5);
weightedGraph.addEdge("B", "C", 2);
weightedGraph.addEdge("C", "Y", 1.5);
weightedGraph.addEdge("C", "Z", 2);
weightedGraph.addEdge("W", "START", 1.5);
weightedGraph.addEdge("W", "X", 1);
weightedGraph.addEdge("X", "START", 1);
weightedGraph.addEdge("X", "Y", 1);
weightedGraph.addEdge("X", "Z", 2);
weightedGraph.addEdge("Y", "Z", 1.5);
weightedGraph.addEdge("Z", "START", 1);

export const ROUNDABOUTS = {
    A: ["Z", "Y", "X", "W"],
    B: ["C", "Y", "A"],
    C: ["Z", "Y", "B"],
    W: ["A", "X", "START"],
    X: ["W", "A", "Y", "Z", "START"],
    Y: ["B", "C", "Z", "X", "A"],
    Z: ["Y", "C", "START", "X"],
    START: ["Z", "X", "W"],
};

export const getRoundaboutExit = (
    from: string | null,
    on: string,
    to: string,
) => {
    const exits = ROUNDABOUTS[on as keyof typeof ROUNDABOUTS];
    console.log("Exits", exits, on, ROUNDABOUTS, to);
    const outIndex = exits.indexOf(to);

    if (!from) {
        return outIndex;
    }

    const inIndex = exits.indexOf(from);

    const diff = (outIndex - inIndex) % exits.length;
    return diff;
};

export const createGraph = (stage: Konva.Stage) => {
    const graph = new Graph(stage, weightedGraph);
    graph.setNodePosition("A", Position.MIN, Position.FOUR_FIFTH);
    graph.setNodePosition("B", Position.CENTRE, Position.MAX);
    graph.setNodePosition("C", Position.MAX, Position.FOUR_FIFTH);
    graph.setNodePosition("W", Position.MIN, Position.TWO_FIFTH);
    graph.setNodePosition("X", Position.FIFTH, Position.TWO_FIFTH);
    graph.setNodePosition("Y", Position.CENTRE, Position.CENTRE);
    graph.setNodePosition("Z", Position.MAX, Position.TWO_FIFTH);
    graph.setNodePosition("START", Position.CENTRE, Position.MIN);
    return graph;
};
