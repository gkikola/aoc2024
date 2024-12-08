const CELL_EMPTY = '.';
const CELL_OBSTRUCTION = '#';
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
  #patrolId;

  constructor(map) {
    this.#buildMap(map);
  }

  #coordsToIndex(position) {
    return position[1] * this.#width + position[0];
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #buildMap(mapString) {
    this.#map = [];
    this.#width = mapString.indexOf('\n');
    this.#height = Math.floor(mapString.length / (this.#width + 1));
    this.#guardPosition = null;
    this.#guardVelocity = null;
    this.#patrolId = 0;

    for (const c of mapString) {
      let type = CELL_EMPTY;
      let collisionList = null;
      switch (c) {
        case CELL_OBSTRUCTION:
          type = CELL_OBSTRUCTION;
          collisionList = new Set();
          break;
        case CELL_GUARD_UP:
        case CELL_GUARD_DOWN:
        case CELL_GUARD_LEFT:
        case CELL_GUARD_RIGHT:
          this.#guardPosition = this.#indexToCoords(this.#map.length);
          this.#setGuardVelocity(c);
          break;
        default:
          break;
      }

      if (c !== '\n') {
        this.#map.push({ type, collisionList, patrolId: -1 });
      }
    }
  }

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

  static #rotateVelocity(velocity) {
    if (velocity === null) return null;
    return [-velocity[1], velocity[0]];
  }

  static #arePositionsEqual(pos1, pos2) {
    if (pos1 == null || pos2 == null) return false;

    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
  }

  #at(position) {
    const [x, y] = position;
    if (x < 0 || x >= this.#width || y < 0 || y >= this.#height) {
      return null;
    }

    return this.#map[this.#coordsToIndex(position)];
  }

  #visit(position, patrolId) {
    this.#map[this.#coordsToIndex(position)].patrolId = patrolId;
  }

  // Returns true if the same collision happened before
  #collide(target, source, patrolId) {
    const cell = this.#map[this.#coordsToIndex(target)];
    const sourceIndex = this.#coordsToIndex(source);

    if (cell.patrolId !== patrolId) {
      cell.collisionList = new Set();
      cell.patrolId = patrolId;
    } else if (cell.collisionList.has(sourceIndex)) {
      return true;
    }

    cell.collisionList.add(sourceIndex);
    return false;
  }

  #patrol(extraObstruction = null) {
    let position = this.#guardPosition;
    let velocity = this.#guardVelocity;
    let visitedCount = 0;
    let stuckInLoop = false;
    this.#patrolId++;

    while (position !== null) {
      // Visit current position
      if (this.#at(position).patrolId !== this.#patrolId) {
        this.#visit(position, this.#patrolId);
        visitedCount++;
      }

      const nextPosition = [
        position[0] + velocity[0],
        position[1] + velocity[1],
      ];
      const nextCell = this.#at(nextPosition);

      if (nextCell === null) {
        // Guard has left the area (went out of bounds)
        position = null;
      } else if (
        nextCell.type === CELL_OBSTRUCTION ||
        Lab.#arePositionsEqual(nextPosition, extraObstruction)
      ) {
        stuckInLoop = this.#collide(nextPosition, position, this.#patrolId);
        if (stuckInLoop) position = null;
        else velocity = Lab.#rotateVelocity(velocity);
      } else {
        position = nextPosition;
      }
    }

    return { visitedCount, stuckInLoop };
  }

  countVisits() {
    return this.#patrol().visitedCount;
  }

  countNewObstructionPositions() {
    // Make sure initial patrol has been done
    if (this.#patrolId < 0) this.#patrol();

    let count = 0;
    this.#map.forEach((cell, index) => {
      const position = this.#indexToCoords(index);
      if (cell.type !== CELL_EMPTY || cell.patrolId < 0) return;
      if (Lab.#arePositionsEqual(position, this.#guardPosition)) return;

      if (this.#patrol(position).stuckInLoop) count++;
    });

    return count;
  }
}

export default function run(input) {
  const lab = new Lab(input);
  return [lab.countVisits(), lab.countNewObstructionPositions()];
}
