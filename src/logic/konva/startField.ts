import Konva from "konva";
import { COLOUR } from "../pren/constants";

export const addStartField = (stage: Konva.Stage) => {
    const layer = new Konva.Layer();
    stage.add(layer);

    const stageWidth = stage.width();
    const size = 37;
    const x = stageWidth / 2 - size / 2;

    const gradient = layer
        .getCanvas()
        .getContext()
        .createLinearGradient(0, 0, size, size);

    const gradA = COLOUR.PRIMARY_CONTRAST;
    const gradB = COLOUR.ACCENT;
    const steps = 20;
    const ratio = 4;

    const stepSize = 1 / steps;

    for (let i = 0; i < steps; i++) {
        const position = stepSize * i;
        const nextPosition = stepSize * (i + 1);
        const colour = i % ratio == 0 ? gradB : gradA;
        gradient.addColorStop(position, colour);
        gradient.addColorStop(nextPosition, colour);
    }

    const rect = new Konva.Rect({
        x,
        y: 0,
        width: size,
        height: size,
        fill: gradient,
        opacity: 0.5,
    });

    const line = new Konva.Line({
        points: [stageWidth / 2, 0, stageWidth / 2, size + 10],
        stroke: COLOUR.PRIMARY,
        strokeWidth: 10,
    });

    layer.add(rect);
    layer.add(line);
    layer.moveToBottom();
};
