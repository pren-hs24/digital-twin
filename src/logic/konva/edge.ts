import Konva from "konva";
import { type EdgeDefinition } from "./graph";
import { Node } from "./node";
import { createLabel } from "./label";
import { COLOUR } from "../pren/constants";
import { WeightedGraph } from "../graph";

type EventListener = (edge: Edge, selected: boolean) => void;

export class Edge implements EdgeDefinition {
    private layer: Konva.Layer;
    private _nodeA: Node;
    private _nodeB: Node;
    private _weightedGraph: WeightedGraph;
    private _line: Konva.Line;
    private _label: Konva.Label;
    private _selected = false;
    private onSelect: EventListener | null;
    private weight: number = -1;

    constructor(
        layer: Konva.Layer,
        nodeA: Node,
        nodeB: Node,
        graph: WeightedGraph,
        onSelect: EventListener | null,
    ) {
        this.layer = layer;
        this._nodeA = nodeA;
        this._nodeB = nodeB;
        this._weightedGraph = graph;
        this.onSelect = onSelect;
        this._line = this.createLine(layer);
        this._label = this.createLabel(layer);

        this._nodeA.addOnMoveListener(() => this.updateEdgePosition());
        this._nodeB.addOnMoveListener(() => this.updateEdgePosition());
    }

    private updateEdgePosition() {
        const points = this._line.points();

        points[0] = this._nodeA.x;
        points[1] = this._nodeA.y;
        points[2] = this._nodeB.x;
        points[3] = this._nodeB.y;

        this._label.setPosition({
            x: (this._nodeA.x + this._nodeB.x) / 2,
            y: (this._nodeA.y + this._nodeB.y) / 2,
        });
    }

    private createLine(layer: Konva.Layer) {
        const line = new Konva.Line({
            points: [
                this._nodeA.x,
                this._nodeA.y,
                this._nodeB.x,
                this._nodeB.y,
            ],
            stroke: COLOUR.PRIMARY,
            strokeWidth: 10,
        });
        line.on("click", this._onClick);

        layer.add(line);
        return line;
    }

    private get graphEdge() {
        return this._weightedGraph.getEdge(this.nodeA, this.nodeB);
    }

    private createLabel(layer: Konva.Layer) {
        this.weight = this.graphEdge.weight;
        const label = createLabel(
            (this._nodeA.x + this._nodeB.x) / 2,
            (this._nodeA.y + this._nodeB.y) / 2,
            this.graphEdge.weight + "m",
        );
        layer.add(label);
        label.on("click", this._onClick);
        return label;
    }

    private _onClick = () => {
        this._selected = !this._selected;

        this.updateEdgeStroke(this, false);
        this.onSelect?.(this, this._selected);
    };

    public get nodeA() {
        return this._nodeA.name;
    }

    public get nodeB() {
        return this._nodeB.name;
    }

    public deselect() {
        this._selected = false;
        this.updateEdgeStroke(this, false);
    }

    public update(path: string[]) {
        // if any fromKey is followed by toKey in the path
        // or if any toKey is followed by fromKey in the path
        const isPartOfRoute =
            path.some((node, i) => {
                if (i === path.length - 1) {
                    return false;
                }
                return (
                    (node === this.nodeA && path[i + 1] === this.nodeB) ||
                    (node === this.nodeB && path[i + 1] === this.nodeA)
                );
            }) || path.length === 1;

        this.updateWeight();
        this.updateEdgeStroke(this, isPartOfRoute);
    }

    private updateWeight() {
        if (this.graphEdge.weight == this.weight) return;
        this._label.destroy();
        this._label = this.createLabel(this.layer);
    }

    private updateEdgeStroke(
        edge: EdgeDefinition,
        isPartOfRoute: boolean = false,
    ) {
        const line = this._line;
        const graphEdge = this._weightedGraph.getEdge(edge.nodeA, edge.nodeB);
        line.stroke(COLOUR.PRIMARY);

        if (graphEdge.disabled) {
            line.stroke(COLOUR.PRIMARY);
            line.dash([33, 10]);
        } else {
            line.dash([]);
        }

        if (this._selected) {
            if (graphEdge.obstructed) {
                line.stroke(COLOUR.ACCENT_DARK);
            } else {
                line.stroke(COLOUR.ACCENT);
            }
        } else if (isPartOfRoute) {
            if (graphEdge.obstructed) {
                line.stroke(COLOUR.GREEN_DARK);
            } else {
                line.stroke(COLOUR.GREEN);
            }
        } else if (graphEdge.obstructed) {
            line.stroke(COLOUR.YELLOW);
        } else {
            line.stroke(COLOUR.PRIMARY);
        }
    }
}
