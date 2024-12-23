import Heap from '../utility/heap.js';

const WIDTH = 71;
const HEIGHT = 71;
const TEST_WIDTH = 7;
const TEST_HEIGHT = 7;
const CORRUPTION_COUNT = 1024;
const TEST_CORRUPTION_COUNT = 12;

const DIRECTIONS = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
];

class MemorySpace {
  #fallingBytes;
  #width;
  #height;
  #end;

  constructor(fallingBytes, width = WIDTH, height = HEIGHT) {
    this.#width = width;
    this.#height = height;

    this.#fallingBytes = fallingBytes.split('\n').reduce((result, entry) => {
      if (entry.length > 0) {
        const coordinates = entry.split(',').map((v) => Number.parseInt(v, 10));
        const index = this.#coordsToIndex(...coordinates);
        result.push(index);
      }
      return result;
    }, []);

    this.#end = this.#coordsToIndex(width - 1, height - 1);
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
  }

  calculateMinimumSteps(corruptionCount) {
    const unvisited = new Heap((a, b) => {
      if (a.cost === b.cost) return 0;
      if (b.cost === null) return -1;
      if (a.cost === null) return 1;
      return a.cost - b.cost;
    });
    const positions = new Map();

    const corrupted = new Set();
    for (let i = 0; i < corruptionCount; i++) {
      corrupted.add(this.#fallingBytes[i]);
    }

    const start = { index: 0, cost: 0 };
    positions.set(start.index, start);
    unvisited.push(start);

    // Dijkstra's algorithm
    while (unvisited.size > 0) {
      const curPos = unvisited.pop();
      if (curPos.index === this.#end) return curPos.cost;

      const [x, y] = this.#indexToCoords(curPos.index);
      DIRECTIONS.forEach(([deltaX, deltaY]) => {
        const adjX = x + deltaX;
        const adjY = y + deltaY;
        if (this.#isInBounds(adjX, adjY)) {
          const index = this.#coordsToIndex(adjX, adjY);
          if (!positions.has(index) && !corrupted.has(index)) {
            const adjPos = { index, cost: curPos.cost + 1 };
            positions.set(index, adjPos);
            unvisited.push(adjPos);
          }
        }
      });
    }

    return null;
  }

  findFirstBlockingFall(start = 0) {
    let min = start;
    let max = this.#fallingBytes.length;

    while (min < max) {
      const midpoint = Math.floor((min + max) / 2);
      const result = this.calculateMinimumSteps(midpoint);

      if (result == null) max = midpoint;
      else min = midpoint + 1;
    }

    return this.#indexToCoords(this.#fallingBytes[min - 1]);
  }
}

export default function run(input) {
  const testInput = input.length < 150;
  const width = testInput ? TEST_WIDTH : WIDTH;
  const height = testInput ? TEST_HEIGHT : HEIGHT;
  const corruptionCount = testInput ? TEST_CORRUPTION_COUNT : CORRUPTION_COUNT;

  const memorySpace = new MemorySpace(input, width, height);
  const minSteps = memorySpace.calculateMinimumSteps(corruptionCount);
  return [
    minSteps,
    memorySpace.findFirstBlockingFall(corruptionCount).join(','),
  ];
}
