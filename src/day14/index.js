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

  #coordsToIndex(x, y) {
    return y * this.#areaWidth + x;
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

  #getPosVariance() {
    const posSum = (robot) => robot.posX + robot.posY;
    const n = this.#robots.length;
    const mean =
      this.#robots.reduce((sum, robot) => sum + posSum(robot), 0) / n;
    const squaredDevSum = this.#robots
      .map((robot) => (posSum(robot) - mean) ** 2)
      .reduce((sum, squaredDev) => sum + squaredDev);

    return squaredDevSum / n;
  }

  simulateMovement(duration = 1) {
    for (const robot of this.#robots) {
      robot.posX = RobotSimulator.#calculateFinalCoordinate(
        robot.posX,
        robot.velX,
        duration,
        this.#areaWidth,
      );
      robot.posY = RobotSimulator.#calculateFinalCoordinate(
        robot.posY,
        robot.velY,
        duration,
        this.#areaHeight,
      );
    }
  }

  findEasterEgg() {
    /* The grid will repeat every n steps, where n is the least common
     * multiple of the width and the height. */
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const lcm = (a, b) => (a * b) / gcd(a, b);
    const maxDuration = lcm(this.#areaWidth, this.#areaHeight);
    let minimumVariance = null;
    let result = 0;

    // Find the second at which there is minimal variance in robot position
    for (let duration = 0; duration < maxDuration; duration++) {
      const variance = this.#getPosVariance();
      if (minimumVariance === null || variance < minimumVariance) {
        minimumVariance = variance;
        result = duration;
      }
      this.simulateMovement();
    }

    return result;
  }

  printRobots() {
    const grid = [];

    for (let y = 0; y < this.#areaHeight; y++) {
      for (let x = 0; x < this.#areaWidth; x++) {
        grid.push(0);
      }
    }

    this.#robots.forEach((robot) => {
      grid[this.#coordsToIndex(robot.posX, robot.posY)]++;
    });

    let result = '';
    for (let y = 0; y < this.#areaHeight; y++) {
      for (let x = 0; x < this.#areaWidth; x++) {
        const index = this.#coordsToIndex(x, y);
        result += grid[index] > 0 ? grid[index].toString() : ' ';
      }
      if (y + 1 < this.#areaHeight) result += '\n';
    }

    console.log(result);
  }
}

export default function run(input) {
  // The problem input uses a different area size than the example input
  const testInput = input.length <= 200;
  const areaWidth = testInput ? TEST_AREA_WIDTH : AREA_WIDTH;
  const areaHeight = testInput ? TEST_AREA_HEIGHT : AREA_HEIGHT;
  const simulator = new RobotSimulator(input, areaWidth, areaHeight);

  const safetyFactor = simulator.calculateSafetyFactor(100);
  const easterEgg = testInput ? 0 : simulator.findEasterEgg();
  return [safetyFactor, easterEgg];
}
