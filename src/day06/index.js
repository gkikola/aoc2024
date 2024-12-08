const CELL_OBSTRUCTION = '#';
const CELL_VISITED = 'X';
const CELL_GUARD_UP = '^';
const CELL_GUARD_DOWN = 'v';
const CELL_GUARD_LEFT = '<';
const CELL_GUARD_RIGHT = '>';

class Lab {
  #map;
  #width;
  #height;
  #guardPosition;
  #guardVelocity;
  #visitedCount;

  #setGuardVelocity(symbol) {
    switch (symbol) {
      case CELL_GUARD_UP:
        this.#guardVelocity = [0, -1];
        break;
      case CELL_GUARD_DOWN:
        this.#guardVelocity = [0, 1];
        break;
      case CELL_GUARD_LEFT:
        this.#guardVelocity = [-1, 0];
        break;
      case CELL_GUARD_RIGHT:
        this.#guardVelocity = [1, 0];
        break;
      default:
        break;
    }
  }

  #locateGuard() {
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        switch (this.at(x, y)) {
          case CELL_GUARD_UP:
          case CELL_GUARD_DOWN:
          case CELL_GUARD_LEFT:
          case CELL_GUARD_RIGHT:
            return [x, y];
          default:
            break;
        }
      }
    }

    return null;
  }

  #rotateGuard() {
    if (this.#guardVelocity === null) return;
    this.#guardVelocity = [-this.#guardVelocity[1], this.#guardVelocity[0]];
  }

  constructor(map) {
    this.#map = Array.from(map);
    this.#width = map.indexOf('\n');
    this.#height = Math.floor(map.length / (this.#width + 1));
    this.#guardPosition = this.#locateGuard();
    if (this.#guardPosition !== null) {
      this.#setGuardVelocity(this.at(...this.#guardPosition));
    }
    this.#visitedCount = 0;
  }

  at(x, y) {
    if (x < 0 || x >= this.#width || y < 0 || y >= this.#height) {
      return null;
    }

    return this.#map[y * (this.#width + 1) + x];
  }

  #set(x, y, value) {
    this.#map[y * (this.#width + 1) + x] = value;
  }

  patrol() {
    while (this.#guardPosition !== null) {
      // Visit current position
      if (this.at(...this.#guardPosition) !== CELL_VISITED) {
        this.#set(...this.#guardPosition, CELL_VISITED);
        this.#visitedCount++;
      }

      const nextPosition = [
        this.#guardPosition[0] + this.#guardVelocity[0],
        this.#guardPosition[1] + this.#guardVelocity[1],
      ];

      switch (this.at(...nextPosition)) {
        case null:
          // Guard has left the area (went out of bounds)
          this.#guardPosition = null;
          break;
        case CELL_OBSTRUCTION:
          this.#rotateGuard();
          break;
        default:
          this.#guardPosition = nextPosition;
          break;
      }
    }
  }

  get visitedCount() {
    return this.#visitedCount;
  }
}

export default function run(input) {
  const lab = new Lab(input);
  lab.patrol();

  return lab.visitedCount;
}
