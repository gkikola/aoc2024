const DIRECTIONS = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1],
];
const DIRECTION_RIGHT = 0;

const MOVEMENT_COST = 1;
const ROTATION_COST = 1000;

class Maze {
  #cells;
  #width;
  #height;
  #start;
  #end;

  constructor(mapStr) {
    this.#buildMap(mapStr);
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#cells = [...mapStr].filter((c) => c !== '\n');
    this.#height = Math.floor(this.#cells.length / this.#width);

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
    const cellCost = new Map();
    const cellDirection = new Map();
    const unvisited = new Set();
    let curCell = this.#start;
    let curDirection = DIRECTION_RIGHT;
    let curCost = 0;
    cellCost.set(this.#start, curCost);
    cellDirection.set(this.#start, curDirection);

    this.#cells.forEach((value, index) => {
      if (value === '.') unvisited.add(index);
    });

    const setNextCell = () => {
      // Find unvisited cell with the smallest cost
      let minCost = null;
      unvisited.forEach((index) => {
        const cost = cellCost.get(index);
        if (cost != null && (minCost === null || cost < minCost)) {
          minCost = cost;
          curCost = cost;
          curCell = index;
          curDirection = cellDirection.get(index);
        }
      });

      if (minCost === null) curCell = null;
    };

    const rotate = () => {
      curDirection = (curDirection + 1) % DIRECTIONS.length;
    };

    while (unvisited.size > 0) {
      setNextCell();
      if (curCell === null) return null; // All remaining cells are unreachable
      if (curCell === this.#end) return curCost; // Reached the end
      unvisited.delete(curCell);

      for (let i = 0; i < DIRECTIONS.length; i++) {
        // Rotating 270 deg is the same as rotating 90 in other direction
        const newCost =
          curCost + MOVEMENT_COST + ROTATION_COST * (i === 3 ? 1 : i);

        const [x, y] = this.#indexToCoords(curCell);
        const targetX = x + DIRECTIONS[curDirection][0];
        const targetY = y + DIRECTIONS[curDirection][1];
        const targetIndex = this.#coordsToIndex(targetX, targetY);

        if (unvisited.has(targetIndex)) {
          const oldCost = cellCost.get(targetIndex);
          if (oldCost == null || newCost < oldCost) {
            cellCost.set(targetIndex, newCost);
            cellDirection.set(targetIndex, curDirection);
          }
        }

        rotate();
      }
    }

    return null;
  }
}

export default function run(input) {
  const maze = new Maze(input);
  return maze.getMinimumScore();
}
