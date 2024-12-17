class Warehouse {
  #cells;
  #width;
  #height;
  #robot;
  #moves;
  #time;

  constructor(dataStr) {
    const [mapStr, moveStr] = dataStr.split('\n\n');
    this.#buildMap(mapStr);
    this.#storeMoves(moveStr);
    this.#time = 0;
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#cells = [...mapStr].filter((c) => c !== '\n');
    this.#height = Math.floor(this.#cells.length / this.#width);

    // Store starting position of robot and remove '@' symbol from grid
    this.#robot = this.#cells.indexOf('@');
    this.#cells[this.#robot] = '.';
  }

  #storeMoves(moveStr) {
    this.#moves = [...moveStr].filter((c) => c !== '\n');
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

  static getGpsCoordinate(x, y) {
    return x + 100 * y;
  }

  getCell(x, y) {
    return this.#cells[this.#coordsToIndex(x, y)];
  }

  #setCell(x, y, value) {
    this.#cells[this.#coordsToIndex(x, y)] = value;
  }

  // Returns true if the box was successfully pushed
  #pushBox(x, y, deltaX, deltaY) {
    if (this.getCell(x, y) !== 'O') return false;

    const targetX = x + deltaX;
    const targetY = y + deltaY;
    if (!this.#isPositionInBounds(targetX, targetY)) return false;

    const targetCell = this.getCell(targetX, targetY);
    if (targetCell === '.') {
      this.#setCell(x, y, '.');
      this.#setCell(targetX, targetY, 'O');
      return true;
    }

    if (targetCell === 'O') {
      if (!this.#pushBox(targetX, targetY, deltaX, deltaY)) return false;
      this.#setCell(x, y, '.');
      this.#setCell(targetX, targetY, 'O');
      return true;
    }

    return false;
  }

  #moveRobot(deltaX, deltaY) {
    const [robotX, robotY] = this.#indexToCoords(this.#robot);
    const targetX = robotX + deltaX;
    const targetY = robotY + deltaY;
    const targetCell = this.getCell(targetX, targetY);

    if (!this.#isPositionInBounds(targetX, targetY)) return false;

    if (targetCell === '.') {
      this.#robot = this.#coordsToIndex(targetX, targetY);
      return true;
    }

    if (targetCell === 'O') {
      if (!this.#pushBox(targetX, targetY, deltaX, deltaY)) return false;
      this.#robot = this.#coordsToIndex(targetX, targetY);
      return true;
    }

    return false;
  }

  step(count = 1) {
    const iterations = Math.min(count, this.#moves.length - this.#time);
    for (let i = 0; i < iterations; i++) {
      let deltaX = 0;
      let deltaY = 0;
      switch (this.#moves[this.#time]) {
        case '^':
          deltaY = -1;
          break;
        case 'v':
          deltaY = 1;
          break;
        case '<':
          deltaX = -1;
          break;
        case '>':
          deltaX = 1;
          break;
        default:
          break;
      }
      this.#moveRobot(deltaX, deltaY);
      this.#time++;
    }
  }

  run() {
    this.step(this.#moves.length - this.#time);
  }

  get gpsSum() {
    return this.#cells.reduce((sum, value, index) => {
      if (value === 'O') {
        return sum + Warehouse.getGpsCoordinate(...this.#indexToCoords(index));
      }

      return sum;
    }, 0);
  }
}

export default function run(input) {
  const warehouse = new Warehouse(input);
  warehouse.run();

  return warehouse.gpsSum;
}
