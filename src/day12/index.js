class FenceMap {
  #width;
  #height;

  // horiFences and vertFences map columns or rows to sets of fence positions
  #horiFences;
  #vertFences;

  constructor(width, height) {
    this.#width = width;
    this.#height = height;
    this.#horiFences = new Map();
    this.#vertFences = new Map();
  }

  // Each garden position has two positions for fences (left/right or up/down)
  static #gridToFenceCoord(coordinate, downOrRight = false) {
    return coordinate * 2 + (downOrRight ? 1 : 0);
  }

  insertFence(x, y, vertical = false, downOrRight = false) {
    const map = vertical ? this.#vertFences : this.#horiFences;
    const key = FenceMap.#gridToFenceCoord(vertical ? x : y, downOrRight);

    let fenceSet = map.get(key);
    if (!fenceSet) {
      fenceSet = new Set();
      map.set(key, fenceSet);
    }
    fenceSet.add(vertical ? y : x);
  }

  get perimeter() {
    let result = 0;
    this.#horiFences.forEach((row) => {
      result += row.size;
    });
    this.#vertFences.forEach((col) => {
      result += col.size;
    });
    return result;
  }

  #countSides(vertical = false) {
    const fenceMap = vertical ? this.#vertFences : this.#horiFences;
    let result = 0;
    const gridDimension = vertical ? this.#height : this.#width;

    fenceMap.forEach((fenceSet) => {
      let fenceAtPrevPos = false;
      for (let i = 0; i < gridDimension; i++) {
        if (fenceSet.has(i)) {
          if (!fenceAtPrevPos) result++;
          fenceAtPrevPos = true;
        } else {
          fenceAtPrevPos = false;
        }
      }
    });

    return result;
  }

  get sides() {
    return this.#countSides(true) + this.#countSides(false);
  }
}

class Garden {
  #width;
  #height;
  #map;

  constructor(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#height = Math.floor(mapStr.length / (this.#width + 1));
    this.#map = [...mapStr].filter((c) => c !== '\n');
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #isPositionInBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
  }

  #getPlantAt(x, y) {
    if (!this.#isPositionInBounds(x, y)) return null;
    return this.#map[this.#coordsToIndex(x, y)];
  }

  #calculateRegionArea(x, y, visited, fences) {
    const index = this.#coordsToIndex(x, y);
    let area = 0;
    if (visited.has(index)) return 0;
    visited.add(index);

    area = 1;

    const plant = this.#getPlantAt(x, y);

    [
      [x - 1, y, true, false],
      [x, y - 1, false, false],
      [x, y + 1, false, true],
      [x + 1, y, true, true],
    ].forEach(([neighborX, neighborY, vertical, downOrRight]) => {
      if (this.#getPlantAt(neighborX, neighborY) === plant) {
        const neighborArea = this.#calculateRegionArea(
          neighborX,
          neighborY,
          visited,
          fences,
        );

        area += neighborArea;
      } else {
        fences.insertFence(x, y, vertical, downOrRight);
      }
    });

    return area;
  }

  calculateFenceCosts(bulkDiscount = false) {
    const visited = new Set();
    let cost = 0;

    this.#map.forEach((plant, index) => {
      const fenceMap = new FenceMap(this.#width, this.#height);
      const [x, y] = this.#indexToCoords(index);
      const area = this.#calculateRegionArea(x, y, visited, fenceMap);

      if (bulkDiscount) cost += fenceMap.sides * area;
      else cost += fenceMap.perimeter * area;
    });
    return cost;
  }
}

export default function run(input) {
  const garden = new Garden(input);
  return [garden.calculateFenceCosts(), garden.calculateFenceCosts(true)];
}
