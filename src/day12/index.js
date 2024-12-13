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

  #calculateRegionTotals(x, y, visited) {
    const index = this.#coordsToIndex(x, y);
    let perimeter = 0;
    let area = 0;
    if (visited.has(index)) return { perimeter, area };
    visited.add(index);

    area = 1;

    const plant = this.#getPlantAt(x, y);
    [
      [x - 1, y],
      [x, y - 1],
      [x, y + 1],
      [x + 1, y],
    ].forEach(([neighborX, neighborY]) => {
      if (this.#getPlantAt(neighborX, neighborY) === plant) {
        const neighborCosts = this.#calculateRegionTotals(
          neighborX,
          neighborY,
          visited,
        );

        perimeter += neighborCosts.perimeter;
        area += neighborCosts.area;
      } else {
        perimeter++;
      }
    });

    return { perimeter, area };
  }

  calculateFenceCosts() {
    const visited = new Set();
    let cost = 0;

    this.#map.forEach((plant, index) => {
      const [x, y] = this.#indexToCoords(index);
      const regionData = this.#calculateRegionTotals(x, y, visited);
      cost += regionData.perimeter * regionData.area;
    });
    return cost;
  }
}

export default function run(input) {
  const garden = new Garden(input);
  return garden.calculateFenceCosts();
}
