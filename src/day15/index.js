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

  #isPushable(x, y, deltaX, deltaY) {
    const curCell = this.getCell(x, y);
    if (curCell === '#' || !this.#isPositionInBounds(x, y)) return false;
    if (curCell === '.') return true;

    // If the box is narrow or being moved horizontally...
    if (curCell === 'O' || deltaY === 0) {
      return this.#isPushable(x + deltaX, y + deltaY, deltaX, deltaY);
    }

    // Otherwise, the box is wide and being moved vertically
    const leftX = (curCell === '[' ? x : x - 1) + deltaX;
    const rightX = (curCell === '[' ? x + 1 : x) + deltaX;
    return (
      this.#isPushable(leftX, y + deltaY, deltaX, deltaY) &&
      this.#isPushable(rightX, y + deltaY, deltaX, deltaY)
    );
  }

  // Returns true if the box was successfully pushed
  #pushBox(x, y, deltaX, deltaY) {
    if (!this.#isPushable(x, y, deltaX, deltaY)) return false;

    const curCell = this.getCell(x, y);
    const targetX = x + deltaX;
    const targetY = y + deltaY;

    if (deltaY !== 0 && (curCell === '[' || curCell === ']')) {
      const leftX = (curCell === '[' ? x : x - 1) + deltaX;
      const rightX = (curCell === '[' ? x + 1 : x) + deltaX;

      // Clear space for left and right halves of the box
      this.#pushBox(leftX, targetY, deltaX, deltaY);
      this.#pushBox(rightX, targetY, deltaX, deltaY);

      this.#setCell(leftX, targetY, '[');
      this.#setCell(rightX, targetY, ']');
      this.#setCell(leftX - deltaX, y, '.');
      this.#setCell(rightX - deltaX, y, '.');
    } else if (curCell === 'O' || curCell === '[' || curCell === ']') {
      this.#pushBox(targetX, targetY, deltaX, deltaY);
      this.#setCell(targetX, targetY, curCell);
      this.#setCell(x, y, '.');
    }

    return true;
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

    if (targetCell === 'O' || targetCell === '[' || targetCell === ']') {
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
      if (value === 'O' || value === '[') {
        return sum + Warehouse.getGpsCoordinate(...this.#indexToCoords(index));
      }

      return sum;
    }, 0);
  }

  toString() {
    let result = '';
    for (let y = 0; y < this.#height; y++) {
      if (y > 0) result += '\n';

      for (let x = 0; x < this.#width; x++) {
        const index = this.#coordsToIndex(x, y);
        if (this.#robot === index) result += '@';
        else result += this.#cells[index];
      }
    }
    return result;
  }
}

export default function run(input) {
  const stdWarehouse = new Warehouse(input);
  stdWarehouse.run();
  const stdGpsSum = stdWarehouse.gpsSum;

  const wideInput = input.replaceAll(/#|O|\.|@/g, (match) => {
    switch (match) {
      case '#':
        return '##';
      case 'O':
        return '[]';
      case '.':
        return '..';
      case '@':
        return '@.';
      default:
        return `${match}${match}`;
    }
  });
  const wideWarehouse = new Warehouse(wideInput);
  wideWarehouse.run();
  const wideGpsSum = wideWarehouse.gpsSum;

  return [stdGpsSum, wideGpsSum];
}
