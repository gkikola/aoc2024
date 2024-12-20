import Heap from '../utility/heap.js';
import Queue from '../utility/queue.js';

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const INITIAL_DIRECTION = 0;
const MOVEMENT_COST = 1;
const ROTATION_COST = 1000;

class Maze {
  #tiles;
  #nodes;
  #unvisitedNodes;
  #width;
  #startIndex;
  #endIndex;

  constructor(mapStr) {
    this.#buildMap(mapStr);
    this.#buildGraph();
    this.#findPath();
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#tiles = [...mapStr]
      .filter((c) => c !== '\n')
      .map((value, index) => {
        if (value === 'S') this.#startIndex = index;
        else if (value === 'E') this.#endIndex = index;
        return value === 'S' || value === 'E' ? '.' : value;
      });
  }

  static #GraphNode(
    index,
    direction,
    cost = null,
    neighbors = [],
    neighborCosts = [],
  ) {
    return {
      index,
      direction,
      cost,
      neighbors,
      neighborCosts,
      previous: [],
    };
  }

  static #nodeKey(index, direction) {
    // Used as a key in the node map
    return index * 4 + direction;
  }

  #getNode(index, direction) {
    return this.#nodes.get(Maze.#nodeKey(index, direction));
  }

  #setNode(index, direction, node) {
    this.#nodes.set(Maze.#nodeKey(index, direction), node);
  }

  #hasNode(index, direction) {
    return this.#nodes.has(Maze.#nodeKey(index, direction));
  }

  #buildGraph(start = this.#startIndex, direction = INITIAL_DIRECTION) {
    const visited = new Set();
    const toVisit = new Queue();
    this.#nodes = new Map();
    this.#unvisitedNodes = new Heap((a, b) => {
      if (a.cost === b.cost) return 0;
      if (b.cost === null) return -1;
      if (a.cost === null) return 1;
      return a.cost - b.cost;
    });
    const startNode = Maze.#GraphNode(start, direction, 0);
    this.#setNode(start, direction, startNode);
    toVisit.enqueue(startNode);
    this.#unvisitedNodes.push(startNode);

    const addNeighbor = (node, neighborIndex, neighborDirection, cost) => {
      if (this.#tiles[neighborIndex] !== '.') return;

      let neighbor;
      if (this.#hasNode(neighborIndex, neighborDirection)) {
        neighbor = this.#getNode(neighborIndex, neighborDirection);
      } else {
        neighbor = Maze.#GraphNode(
          neighborIndex,
          neighborDirection,
          null,
          [node],
          [cost],
        );

        toVisit.enqueue(neighbor);
        this.#unvisitedNodes.push(neighbor);
        this.#setNode(neighborIndex, neighborDirection, neighbor);
      }
      node.neighbors.push(neighbor);
      node.neighborCosts.push(cost);
    };

    while (toVisit.size > 0) {
      const curNode = toVisit.dequeue();
      const { index: curIndex, direction: curDirection } = curNode;

      if (!visited.has(Maze.#nodeKey(curIndex, curDirection))) {
        const [curX, curY] = this.#indexToCoords(curIndex);
        const [deltaX, deltaY] = DIRECTIONS[curDirection];
        const forwardIndex = this.#coordsToIndex(curX + deltaX, curY + deltaY);
        const clockwiseTurn = (curDirection + 1) % 4;
        const counterClockwiseTurn = (curDirection + 3) % 4;

        /* Each node has up to three neighbors:
         * - The node for the tile immediately in front of it, facing the same
         *   direction.
         * - The node occupying the same tile but turned clockwise.
         * - The node occupying the same time but turned counterclockwise.
         */
        addNeighbor(curNode, forwardIndex, curDirection, MOVEMENT_COST);
        addNeighbor(curNode, curIndex, clockwiseTurn, ROTATION_COST);
        addNeighbor(curNode, curIndex, counterClockwiseTurn, ROTATION_COST);

        visited.add(Maze.#nodeKey(curIndex, curDirection));
      }
    }
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #findPath() {
    // Dijkstra's algorithm
    while (this.#unvisitedNodes.size > 0) {
      const curNode = this.#unvisitedNodes.pop();
      curNode.neighbors.forEach((node, index) => {
        const neighbor = node;
        const curCost = curNode.cost + curNode.neighborCosts[index];
        if (neighbor.cost === null || curCost <= neighbor.cost) {
          neighbor.cost = curCost;
          neighbor.previous.push(curNode);
          this.#unvisitedNodes.updateValue(neighbor);
        }
      });
    }
  }

  #getMinCostEndNodes() {
    const endNodes = [0, 1, 2, 3].map((direction) =>
      this.#getNode(this.#endIndex, direction),
    );

    const minCost = endNodes.reduce((min, node) => {
      if (node == null) return min;
      if (min == null) return node.cost;
      return node.cost < min ? node.cost : min;
    }, null);

    return endNodes.filter((node) => node.cost === minCost);
  }

  getMinimumScore() {
    const nodes = this.#getMinCostEndNodes();
    if (nodes.length === 0) return null;

    return nodes[0].cost;
  }

  getBestPathTileCount() {
    const toVisit = new Queue();
    const visited = new Set();

    this.#getMinCostEndNodes().forEach((node) => {
      toVisit.enqueue(node);
    });

    let count = 0;
    while (toVisit.size > 0) {
      const curNode = toVisit.dequeue();
      curNode.previous.forEach((node) => {
        toVisit.enqueue(node);
      });

      if (!visited.has(curNode.index)) {
        visited.add(curNode.index);
        count++;
      }
    }

    return count;
  }

  // For debugging
  pathToString() {
    const outputArr = [...this.#tiles];
    const toVisit = new Queue();
    this.#getMinCostEndNodes().forEach((node) => {
      toVisit.enqueue(node);
    });
    while (toVisit.size > 0) {
      const curNode = toVisit.dequeue();
      let char;
      switch (curNode.direction) {
        case 0:
          char = '>';
          break;
        case 1:
          char = 'v';
          break;
        case 2:
          char = '<';
          break;
        case 3:
          char = '^';
          break;
        default:
          char = 'O';
          break;
      }
      outputArr[curNode.index] = char;

      curNode.previous.forEach((n) => {
        toVisit.enqueue(n);
      });
    }

    return outputArr
      .map((value, index) => {
        if (index % this.#width === this.#width - 1) return `${value}\n`;
        return value;
      })
      .join('');
  }

  // For debugging
  costsToString() {
    const outputArr = [...this.#tiles].map((v) => (v === '.' ? -1 : null));

    const visited = new Set();
    const toVisit = new Queue();

    const getKey = (index, direction) => index * 4 + direction;

    toVisit.enqueue(this.#getNode(this.#startIndex, INITIAL_DIRECTION));
    while (toVisit.size > 0) {
      const curNode = toVisit.dequeue();
      visited.add(getKey(curNode.index, curNode.direction));

      if (
        outputArr[curNode.index] < 0 ||
        (curNode.cost !== null && curNode.cost < outputArr[curNode.index])
      ) {
        outputArr[curNode.index] = curNode.cost;
      }

      curNode.neighbors.forEach((n) => {
        if (!visited.has(getKey(n.index, n.direction))) toVisit.enqueue(n);
      });
    }

    return outputArr
      .map((value, index) => {
        let valueStr;
        if (value === null) valueStr = '#';
        else if (value < 0) valueStr = '-';
        else valueStr = value.toString();
        let result = '';
        for (let i = 0; i < 6 - valueStr.length; i++) {
          result += ' ';
        }
        result += valueStr;
        if (index % this.#width === this.#width - 1) result += '\n';
        return result;
      })
      .join('');
  }
}

export default function run(input) {
  const maze = new Maze(input);
  return [maze.getMinimumScore(), maze.getBestPathTileCount()];
}
