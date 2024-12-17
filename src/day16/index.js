import Heap from '../utility/heap.js';

const DIRECTIONS = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1],
];
const INITIAL_DIRECTION = 0;
const MOVEMENT_COST = 1;
const ROTATION_COST = 1000;

class Maze {
  #cells;
  #width;
  #start;
  #end;

  constructor(mapStr) {
    this.#buildMap(mapStr);
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#cells = [...mapStr].filter((c) => c !== '\n');

    this.#start = this.#cells.indexOf('S');
    this.#cells[this.#start] = '.';
    this.#end = this.#cells.indexOf('E');
    this.#cells[this.#end] = '.';
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  getCell(x, y) {
    return this.#cells[this.#coordsToIndex(x, y)];
  }

  getMinimumScore() {
    const cellInfo = [];
    const unvisited = new Heap((a, b) => {
      if (cellInfo[a].cost === cellInfo[b].cost) return 0;
      if (cellInfo[b].cost === null) return -1;
      if (cellInfo[a].cost === null) return 1;
      return cellInfo[a].cost - cellInfo[b].cost;
    });

    this.#cells.forEach((value, index) => {
      let cost = null;
      if (index === this.#start) cost = 0;
      cellInfo.push({ cost, direction: INITIAL_DIRECTION });
      if (value === '.') unvisited.push(index);
    });

    const rotate = (direction) => (direction + 1) % DIRECTIONS.length;

    while (unvisited.size > 0) {
      const curCell = unvisited.pop();
      const curCost = cellInfo[curCell].cost;

      if (curCost === null) return null; // All remaining cells are unreachable
      if (curCell === this.#end) return curCost; // Reached the end

      let curDirection = cellInfo[curCell].direction;
      for (let i = 0; i < DIRECTIONS.length; i++) {
        // Rotating 270 deg is the same as rotating 90 in other direction
        const newCost =
          curCost + MOVEMENT_COST + ROTATION_COST * (i === 3 ? 1 : i);

        const [x, y] = this.#indexToCoords(curCell);
        const targetX = x + DIRECTIONS[curDirection][0];
        const targetY = y + DIRECTIONS[curDirection][1];
        const targetIndex = this.#coordsToIndex(targetX, targetY);

        const oldCost = cellInfo[targetIndex].cost;
        if (oldCost == null || newCost < oldCost) {
          cellInfo[targetIndex].cost = newCost;
          cellInfo[targetIndex].direction = curDirection;
          unvisited.updateValue(targetIndex);
        }

        curDirection = rotate(curDirection);
      }
    }

    return null;
  }
}

export default function run(input) {
  const maze = new Maze(input);
  return maze.getMinimumScore();
}
