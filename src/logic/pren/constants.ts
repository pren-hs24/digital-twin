const CLEAR_OBSTACLE_PENALTY_S = 5;
const NODE_PENALTY_S = 2;
export const SPEED_M_PER_S = 2; // m/s

export const CLEAR_OBSTACLE_PENALTY_WEIGHT =
    SPEED_M_PER_S * CLEAR_OBSTACLE_PENALTY_S;

export const NODE_PENALTY_WEIGHT = SPEED_M_PER_S * NODE_PENALTY_S;

const primary = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "#fff"
    : "#000";

export const COLOUR = {
    ACCENT: "#535bf2",
    ACCENT_DARK: "#030b92",
    PRIMARY: primary,
    GREEN: "#00bd7e",
    GREEN_DARK: "#00a86b",
    YELLOW: "#c7aa19",
    RED: "#e85454",
};
