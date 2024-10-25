import { type EdgeDefinition } from "./konva/graph";
import {
    CLEAR_OBSTACLE_PENALTY_WEIGHT,
    NODE_PENALTY_WEIGHT,
} from "./pren/constants";

type AdjacencyRecord = {
    node: string;
    weight: number;
    obstructed: boolean;
    disabled: boolean;
};

type GraphWeightings = Record<string, AdjacencyRecord[]>;

export class WeightedGraph {
    _graph: GraphWeightings;
    disabledNodes = [] as string[];
    obstructedEdges = [] as EdgeDefinition[];
    disabledEdges = [] as EdgeDefinition[];

    constructor() {
        this._graph = {};
    }
    addNode(node: string) {
        this._graph[node] ??= [];
    }
    addEdge(nodeA: string, nodeB: string, weight: number = 1) {
        this._graph[nodeA].push({
            node: nodeB,
            weight,
            disabled: false,
            obstructed: false,
        });
        this._graph[nodeB].push({
            node: nodeA,
            weight,
            disabled: false,
            obstructed: false,
        });
    }
    toggleNode(node: string) {
        if (this.disabledNodes.includes(node)) {
            this.disabledNodes = this.disabledNodes.filter((x) => x != node);
        } else {
            this.disabledNodes.push(node);
        }
    }

    getEdge(nodeA: string, nodeB: string) {
        return this._graph[nodeA].find((x) => x.node == nodeB)!;
    }

    public updateEdge(
        nodeA: string,
        nodeB: string,
        weight: number = 1,
        obstructed: boolean = false,
        disabled: boolean = false,
    ) {
        const edgeA = this._graph[nodeA].find((x) => x.node == nodeB)!;
        const edgeB = this._graph[nodeB].find((x) => x.node == nodeA)!;

        edgeA.weight = edgeB.weight = weight;
        edgeA.obstructed = edgeB.obstructed = obstructed;
        edgeA.disabled = edgeB.disabled = disabled;
    }

    _actualWeight(edge: AdjacencyRecord) {
        if (edge.disabled) return Infinity;
        if (edge.obstructed) return edge.weight + CLEAR_OBSTACLE_PENALTY_WEIGHT;
        return edge.weight;
    }

    public get graph() {
        const graph = Object.fromEntries(
            Object.keys(this._graph)
                .filter((x) => !this.disabledNodes.includes(x))
                .map((x) => [
                    x,
                    this._graph[x].map((x) => ({
                        ...x,
                        weight: this._actualWeight(x),
                    })),
                ]),
        );

        return graph;
    }

    public pathPhysicalDistance(path: string[]) {
        if (path.length < 2) return 0;

        let sum = 0;

        for (let i = 0; i < path.length - 1; i++) {
            sum += this.getEdge(path[i], path[i + 1]).weight;
        }

        return sum;
    }

    public pathDistance(path: string[]) {
        if (path.length < 2) return 0;

        let sum = this.pathPhysicalDistance(path);

        sum += this.nodePenaltiesInPath(path);

        return sum;
    }

    public obstaclesInPath(path: string[]) {
        let sum = 0;

        for (let i = 0; i < path.length - 1; i++) {
            sum += this.getEdge(path[i], path[i + 1]).obstructed ? 1 : 0;
        }

        return sum;
    }

    private nodePenaltiesInPath(path: string[]) {
        return (path.length - 2) * NODE_PENALTY_WEIGHT * 0.5;
    }
}
