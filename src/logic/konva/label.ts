import Konva from "konva";

export const createLabel = (x: number, y: number, text: string) => {
    const label = new Konva.Label({
        x,
        y,
    });

    label.add(
        new Konva.Tag({
            fill: "white",
            cornerRadius: 4,
        })
    );

    label.add(
        new Konva.Text({
            text: text,
            fontSize: 14,
            padding: 4,
            fontFamily:
                "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
            fill: "#black",
            align: "center",
        })
    );

    return label;
};
