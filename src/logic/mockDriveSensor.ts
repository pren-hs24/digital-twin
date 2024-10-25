import { DriveSensor, type IDriveListener } from "./engine";
import {
    CLEAR_OBSTACLE_PENALTY_S,
    NODE_PENALTY_S,
    SPEED_M_PER_S,
} from "./pren/constants";

export class MockDriveSensor extends DriveSensor implements IDriveListener {
    takeExit() {
        setTimeout(() => {
            this.turnCompleted();
        }, NODE_PENALTY_S * 1000);
    }

    closeToObstacle() {
        setTimeout(() => {
            this.obstacleCleared();
        }, CLEAR_OBSTACLE_PENALTY_S * 1000);
    }

    navigateToPoint() {
        setTimeout(() => {
            this.targetReached();
        }, SPEED_M_PER_S * 1000);
    }
}
