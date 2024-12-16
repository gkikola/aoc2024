const AREA_WIDTH = 101;
const AREA_HEIGHT = 103;
const TEST_AREA_WIDTH = 11;
const TEST_AREA_HEIGHT = 7;

class RobotSimulator {
  #robots;
  #areaWidth;
  #areaHeight;

  constructor(robotData, areaWidth, areaHeight) {
    this.#robots = [];
    this.#areaWidth = areaWidth;
    this.#areaHeight = areaHeight;
    this.#addRobots(robotData);
  }

  #getQuadrant(x, y) {
    const midX = Math.floor(this.#areaWidth / 2);
    const midY = Math.floor(this.#areaHeight / 2);
    if (y < midY) {
      if (x < midX) return 0;
      if (x > midX) return 1;
    } else if (y > midY) {
      if (x < midX) return 2;
      if (x > midX) return 3;
    }

    return null;
  }

  #addRobots(dataString) {
    const matchExp = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
    dataString.split('\n').forEach((line) => {
      const matchResult = line.match(matchExp);
      if (matchResult === null) return;

      const [, posX, posY, velX, velY] = matchResult.map((value, index) => {
        if (index === 0) return value;
        return Number.parseInt(value, 10);
      });

      this.addRobot(posX, posY, velX, velY);
    });
  }

  addRobot(posX, posY, velX, velY) {
    this.#robots.push({ posX, posY, velX, velY });
  }

  static #calculateFinalCoordinate(pos, vel, duration, size) {
    return (((pos + vel * duration) % size) + size) % size;
  }

  calculateSafetyFactor(duration) {
    const robotCount = [0, 0, 0, 0];
    this.#robots.forEach((robot) => {
      const finalX = RobotSimulator.#calculateFinalCoordinate(
        robot.posX,
        robot.velX,
        duration,
        this.#areaWidth,
      );
      const finalY = RobotSimulator.#calculateFinalCoordinate(
        robot.posY,
        robot.velY,
        duration,
        this.#areaHeight,
      );
      const quadrant = this.#getQuadrant(finalX, finalY);
      if (quadrant !== null) robotCount[quadrant]++;
    });

    return robotCount.reduce((prod, value) => prod * value);
  }
}

export default function run(input) {
  // The problem input uses a different area size than the example input
  const areaWidth = input.length > 200 ? AREA_WIDTH : TEST_AREA_WIDTH;
  const areaHeight = input.length > 200 ? AREA_HEIGHT : TEST_AREA_HEIGHT;
  const simulator = new RobotSimulator(input, areaWidth, areaHeight);

  return simulator.calculateSafetyFactor(100);
}
