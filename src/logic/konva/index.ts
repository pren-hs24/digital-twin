import Konva from "konva";

export const getStage = (element: HTMLElement) => {
    return new Konva.Stage({
        container: element.id,
        width: element.clientWidth,
        height: element.clientHeight,
    });
};
