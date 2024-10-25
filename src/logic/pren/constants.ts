export const CLEAR_OBSTACLE_PENALTY_S = 5;
export const NODE_PENALTY_S = 2;
export const SPEED_M_PER_S = 2; // m/s

export const CLEAR_OBSTACLE_PENALTY_WEIGHT =
    SPEED_M_PER_S * CLEAR_OBSTACLE_PENALTY_S;

export const NODE_PENALTY_WEIGHT = SPEED_M_PER_S * NODE_PENALTY_S;

const style = getComputedStyle(document.body);

export const COLOUR = {
    ACCENT: style.getPropertyValue("--accent"),
    ACCENT_DARK: style.getPropertyValue("--accent-dk"),
    PRIMARY: style.getPropertyValue("--fg"),
    PRIMARY_MUTE: style.getPropertyValue("--fg-mute"),
    PRIMARY_CONTRAST: style.getPropertyValue("--bg"),
    GREEN: style.getPropertyValue("--green"),
    GREEN_DARK: style.getPropertyValue("--green-dk"),
    YELLOW: style.getPropertyValue("--yellow"),
    RED: style.getPropertyValue("--red"),
};
