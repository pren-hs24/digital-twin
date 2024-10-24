import Konva from "konva";
import { COLOUR } from "../pren/constants";

export const createLabel = (x: number, y: number, text: string) => {
    const label = new Konva.Label({
        x,
        y,
    });

    label.add(
        new Konva.Tag({
            fill: COLOUR.PRIMARY_CONTRAST,
            cornerRadius: 4,
        }),
    );

    label.add(
        new Konva.Text({
            text: text,
            fontSize: 14,
            padding: 4,
            fontFamily:
                "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
            fill: COLOUR.PRIMARY_MUTE,
            align: "center",
        }),
    );

    return label;
};
