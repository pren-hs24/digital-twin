import Konva from "konva";
import { WeightedGraph } from "../graph";
import { Node } from "./node";
import { Edge } from "./edge";

export enum Position {
    MIN,
    FIFTH,
    TWO_FIFTH,
    CENTRE,
    THREE_FIFTH,
    FOUR_FIFTH,
    MAX,
}

const evaluatePosition = (
    position: Position,
    containerAxis: number,
    margin: number = 50,
) => {
    const min = margin;
    const max = containerAxis - margin;
    const fifth = max / 5;

    if (position == Position.MIN) return min;
    if (position == Position.FIFTH) return 2 * fifth + margin;
    if (position == Position.TWO_FIFTH) return fifth + margin;
    if (position == Position.CENTRE) return containerAxis / 2;
    if (position == Position.THREE_FIFTH) return 3 * fifth + margin;
    if (position == Position.FOUR_FIFTH) return 4 * fifth + margin;
    if (position == Position.MAX) return max;

    return 0;
};

export type EdgeDefinition = { nodeA: string; nodeB: string };

export class Graph {
    private _stage: Konva.Stage;
    private topLayer: Konva.Layer;
    private backLayer: Konva.Layer;
    public _weightedGraph: WeightedGraph;
    private nodes: Record<string, Node>;
    private edges: Record<string, Record<string, Edge>>;
    private path: string[] = [];

    onToggleNode: ((node: Node) => void) | null = null;
    onSelectEdge: ((edge: EdgeDefinition, selected: boolean) => void) | null =
        null;

    constructor(stage: Konva.Stage, weightedGraph: WeightedGraph) {
        this._stage = stage;
        this.topLayer = new Konva.Layer();
        this.backLayer = new Konva.Layer();
        this._weightedGraph = weightedGraph;
        this.nodes = {};
        this.edges = {};

        this._weightedGraph.onChange = this.updateAll.bind(this);

        this.createNodes();
        this.createEdges();
        this._stage.add(this.backLayer);
        this._stage.add(this.topLayer);
        this._stage.draw();
    }
    private updateAll() {
        for (const node in this.nodes) {
            this.nodes[node].update(
                this.weightedGraph.disabledNodes.includes(node),
            );
            for (const edge of this._weightedGraph.graph?.[node] ?? []) {
                this.updateEdge({ nodeA: node, nodeB: edge.node });
            }
        }
    }
    private createNodes() {
        for (const node of Object.keys(this._weightedGraph.graph)) {
            this.nodes[node] = new Node(this.topLayer, node, (node) =>
                this.onToggleNode?.(node),
            );
        }
    }
    private createEdge(from: string, to: string) {
        if (this.edges[from]?.[to]) return;

        this.edges[from] ??= {};
        this.edges[to] ??= {};

        this.edges[from][to] = new Edge(
            this.backLayer,
            this.nodes[from],
            this.nodes[to],
            this._weightedGraph,
            (edge, selected) => this.onSelectEdge?.(edge, selected),
        );
        this.edges[to][from] = this.edges[from][to];
    }
    private createEdges() {
        for (const node in this._weightedGraph.graph) {
            const edges = this._weightedGraph.graph[node];
            for (const edge of edges) {
                this.createEdge(node, edge.node);
            }
        }
    }
    getNode(node: string) {
        return this.nodes[node];
    }
    setNodePosition(node: string, x: Position, y: Position) {
        this.nodes[node].move({
            x: evaluatePosition(x, this._stage.width()),
            y: evaluatePosition(y, this._stage.height()),
        });
        this._stage.draw();
    }
    markRoute(path: string[]) {
        this.path = path;
        Object.values(this.edges)
            .flat()
            .flatMap((edge) => Object.values(edge))
            .forEach(this.updateEdge.bind(this));
    }
    updateEdge(edge: EdgeDefinition) {
        this.edges[edge.nodeA][edge.nodeB].update(this.path);
    }
    deselectEdge(edge: EdgeDefinition) {
        this.edges[edge.nodeA][edge.nodeB].deselect();
    }

    public get weightedGraph() {
        return this._weightedGraph;
    }

    public get stage() {
        return this._stage;
    }
}
