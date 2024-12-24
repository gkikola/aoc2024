const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const WALL = -1;
const UNASSIGNED_COST = -2;
const DESIRED_TIME = 100;
const TEST_DESIRED_TIME = 50;
const UPDATED_CHEAT_DURATION = 20;

class Track {
  #positions;
  #width;
  #height;
  #startIndex;
  #endIndex;

  constructor(mapStr) {
    this.#buildMap(mapStr);
    this.#assignCosts();
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#height = Math.floor(mapStr.length / (this.#width + 1));

    /* Each map position will be assigned a cost. Special negative values are
     * used to mark positions with unassigned costs or walls. */
    this.#positions = [...mapStr]
      .filter((c) => c !== '\n')
      .map((value, index) => {
        if (value === 'S') this.#startIndex = index;
        else if (value === 'E') this.#endIndex = index;
        if (value === '#') return WALL;
        return UNASSIGNED_COST;
      });
  }

  #assignCosts() {
    let [x, y] = this.#indexToCoords(this.#startIndex);
    const [endX, endY] = this.#indexToCoords(this.#endIndex);
    let cost = 0;

    const getNeighbor = ([deltaX, deltaY]) => [x + deltaX, y + deltaY];

    while (x !== endX || y !== endY) {
      this.#setCostAt(x, y, cost);

      /* Since there is only one path through the course, we just need to find
       * a single valid neighbor. */
      const nextPos = DIRECTIONS.map(getNeighbor).find(
        (target) =>
          this.#isInBounds(...target) &&
          this.#getCostAt(...target) === UNASSIGNED_COST,
      );

      if (nextPos == null) return; // No path
      [x, y] = nextPos;
      cost++;
    }

    this.#setCostAt(endX, endY, cost);
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #getCostAt(x, y) {
    return this.#positions[this.#coordsToIndex(x, y)];
  }

  #setCostAt(x, y, cost) {
    this.#positions[this.#coordsToIndex(x, y)] = cost;
  }

  #isInBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
  }

  #countCheatsAt(startX, startY, minTimeSave = 0, maxDuration = 2) {
    const startCost = this.#getCostAt(startX, startY);
    let count = 0;

    // Check every tile within maxDuration units of the start tile
    for (let y = startY - maxDuration; y <= startY + maxDuration; y++) {
      const vertDuration = Math.abs(y - startY);
      const remaining = maxDuration - vertDuration;
      for (let x = startX - remaining; x <= startX + remaining; x++) {
        if (this.#isInBounds(x, y)) {
          const posCost = this.#getCostAt(x, y);
          if (posCost !== WALL && posCost !== UNASSIGNED_COST) {
            const cheatDuration = vertDuration + Math.abs(x - startX);
            const timeSavings = posCost - startCost - cheatDuration;

            if (timeSavings >= minTimeSave) count++;
          }
        }
      }
    }

    return count;
  }

  countCheats(minTimeSave = 0, maxDuration = 2) {
    return this.#positions.reduce((count, cost, index) => {
      if (cost === WALL) return count;
      return (
        count +
        this.#countCheatsAt(
          ...this.#indexToCoords(index),
          minTimeSave,
          maxDuration,
        )
      );
    }, 0);
  }

  // For debugging
  costsToString() {
    const WALL_SYMBOL = '####';
    const FMT_WIDTH = WALL_SYMBOL.length;
    let result = '';
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        if (x > 0) result += ' ';
        const cost = this.#getCostAt(x, y);
        const costStr = cost === WALL ? WALL_SYMBOL : cost.toString();
        for (let i = 0; i < FMT_WIDTH - costStr.length; i++) result += ' ';
        result += costStr;
      }
      if (y + 1 < this.#height) result += '\n';
    }

    return result;
  }
}

export default function run(input) {
  const testInput = input.length <= 300;
  const minTimeSave = testInput ? TEST_DESIRED_TIME : DESIRED_TIME;

  const track = new Track(input);
  return [
    track.countCheats(minTimeSave),
    track.countCheats(minTimeSave, UPDATED_CHEAT_DURATION),
  ];
}
