import Konva from "konva";
import { COLOUR } from "../pren/constants";
import { createLabel } from "./label";
import { type Point } from "./car";

type EventListener = (node: Node) => void;

export class Node implements Point {
    private _enabled = true;
    private _label: Konva.Label;
    private _name: string;
    private onToggleNode: EventListener | null;
    private _onMove: EventListener[] = [];

    constructor(
        layer: Konva.Layer,
        name: string,
        onToggleNode: EventListener | null,
    ) {
        this._name = name;
        this.onToggleNode = onToggleNode;
        this._label = this.create(layer);
    }

    update(disabled: boolean) {
        this._enabled = !disabled;
        this.circle.fill(disabled ? COLOUR.RED : COLOUR.PRIMARY);
    }

    private create(layer: Konva.Layer) {
        const label = new Konva.Label();
        label.add(
            new Konva.Circle({
                x: 0,
                y: 0,
                radius: 15,
                fill: COLOUR.PRIMARY,
            }),
        );
        label.add(createLabel(0, 0, this.name));
        label.on("click", this.onCircleClick);

        layer.add(label);
        return label;
    }

    private onCircleClick = () => {
        if (this._enabled) {
            this.circle.fill(COLOUR.RED);
        } else {
            this.circle.fill(COLOUR.PRIMARY);
        }

        this._enabled = !this._enabled;
        this.onToggleNode?.(this);
    };

    public addOnMoveListener(listener: EventListener) {
        this._onMove.push(listener);
    }

    public removeOnMoveListener(listener: EventListener) {
        this._onMove = this._onMove.filter((l) => l !== listener);
    }

    private notifyOnMoveListeners() {
        this._onMove.forEach((l) => l(this));
    }

    public move(point: Point) {
        this._label.x(point.x);
        this._label.y(point.y);
        this.notifyOnMoveListeners();
    }

    public get enabled() {
        return this._enabled;
    }

    public get x() {
        return this._label.x();
    }

    public get y() {
        return this._label.y();
    }

    public get name() {
        return this._name;
    }

    private get circle() {
        return this._label.getChildren(
            (x) => x.nodeType == "Shape",
        )[0] as Konva.Circle;
    }
}
