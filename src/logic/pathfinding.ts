import { PriorityQueue } from "./priorityQueue";
import { WeightedGraph } from "./graph";
import { NODE_PENALTY_WEIGHT } from "./pren/constants";
import { DriveSensor, type IDriveListener } from "./engine";

export interface IOptions {
    graph: WeightedGraph;
    from: string;
    to: string;
}

export const dijkstra = (options: IOptions) => {
    const { graph, from, to } = options;
    const nodes = new PriorityQueue<string>();
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const path = []; //to return at end
    let smallest;
    //build up initial state
    for (const vertex in graph.graph) {
        if (vertex === from) {
            distances[vertex] = 0;
            nodes.enqueue(vertex, 0);
        } else {
            distances[vertex] = Infinity;
            nodes.enqueue(vertex, Infinity);
        }
        previous[vertex] = null;
    }
    // as long as there is something to visit
    while (nodes.values.length) {
        smallest = nodes.dequeue().val;
        if (smallest === to) {
            //WE ARE DONE
            //BUILD UP PATH TO RETURN AT END
            while (smallest && previous[smallest]) {
                path.push(smallest);
                smallest = previous[smallest];
            }
            break;
        }
        if (smallest || distances[smallest] !== Infinity) {
            for (const neighbor in graph.graph[smallest]) {
                //find neighboring node
                const nextNode = graph.graph[smallest][neighbor];
                //calculate new distance to neighboring node
                const candidate = distances[smallest] + nextNode.weight;
                const nextNeighbor = nextNode.node;
                if (candidate < distances[nextNeighbor]) {
                    //updating new smallest distance to neighbor
                    distances[nextNeighbor] = candidate;
                    //updating previous - How we got to neighbor
                    previous[nextNeighbor] = smallest;
                    //enqueue in priority queue with new priority
                    nodes.enqueue(nextNeighbor, candidate);
                }
            }
        }
    }
    return smallest ? path.concat(smallest).reverse() : [];
};

export const dijkstraWithWeightedNodes = (options: IOptions) => {
    const { graph, from, to } = options;
    const nodes = new PriorityQueue<string>();
    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const path = []; //to return at end
    let smallest;
    //build up initial state
    for (const vertex in graph.graph) {
        if (vertex === from) {
            distances[vertex] = 0;
            nodes.enqueue(vertex, 0);
        } else {
            distances[vertex] = Infinity;
            nodes.enqueue(vertex, Infinity);
        }
        previous[vertex] = null;
    }
    // as long as there is something to visit
    while (nodes.values.length) {
        smallest = nodes.dequeue().val;
        if (smallest === to) {
            //WE ARE DONE
            //BUILD UP PATH TO RETURN AT END
            while (smallest && previous[smallest]) {
                path.push(smallest);
                smallest = previous[smallest];
            }
            break;
        }
        if (smallest || distances[smallest] !== Infinity) {
            for (const neighbor in graph.graph[smallest]) {
                //find neighboring node
                const nextNode = graph.graph[smallest][neighbor];
                //calculate new distance to neighboring node
                let candidate = distances[smallest] + nextNode.weight;
                const nextNeighbor = nextNode.node;

                // smallest is not from, add penalty
                if (![from, to].includes(nextNeighbor)) {
                    candidate += NODE_PENALTY_WEIGHT;
                }

                if (candidate < distances[nextNeighbor]) {
                    //updating new smallest distance to neighbor
                    distances[nextNeighbor] = candidate;
                    //updating previous - How we got to neighbor
                    previous[nextNeighbor] = smallest;
                    //enqueue in priority queue with new priority
                    nodes.enqueue(nextNeighbor, candidate);
                }
            }
        }
    }
    return smallest ? path.concat(smallest).reverse() : [];
};

export class Pathfinder implements IDriveListener {
    sensor = new DriveSensor();

    navigateToPoint() {}
    takeExit() {}

    findPath(graph: WeightedGraph, target: string) {
        const path = dijkstraWithWeightedNodes({
            graph,
            from: "START",
            to: target,
        });
        console.log(path);
        this.sensor.pathFound(path);
    }
}
