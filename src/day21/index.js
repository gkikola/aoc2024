const DOOR_KEYPAD = '789\n456\n123\n 0A';
const REMOTE_KEYPAD = ' ^A\n<v>';

class Keypad {
  #buttons;
  #labelLookup;
  #width;

  constructor(layout) {
    this.#width = layout.indexOf('\n');
    this.#buttons = [...layout].filter((label) => label !== '\n');
    this.#labelLookup = new Map();
    this.#buttons.forEach((label, index) => {
      this.#labelLookup.set(label, index);
    });
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  getButtonPath(buttonStart, buttonEnd) {
    const startIndex = this.#labelLookup.get(buttonStart);
    const endIndex = this.#labelLookup.get(buttonEnd);
    const gapIndex = this.#labelLookup.get(' ');

    const path = [];
    const [endX, endY] = this.#indexToCoords(endIndex);
    const [gapX, gapY] = this.#indexToCoords(gapIndex);
    let [posX, posY] = this.#indexToCoords(startIndex);
    while (posX !== endX || posY !== endY) {
      /* Left movements should happen first, since they are furthest from the
       * 'A' button. The exception is if an empty gap is in the way. */
      if (posX > endX && (gapY !== posY || gapX < endX || gapX > posX)) {
        for (; posX > endX; posX--) path.push('<');
      }

      // Down movements
      if (posY < endY && (gapX !== posX || gapY > endY || gapY < posY)) {
        for (; posY < endY; posY++) path.push('v');
      }

      // Up movements
      if (posY > endY && (gapX !== posX || gapY < endY || gapY > posY)) {
        for (; posY > endY; posY--) path.push('^');
      }

      // Right movements
      if (posX < endX && (gapY !== posY || gapX > endX || gapX < posX)) {
        for (; posX < endX; posX++) path.push('>');
      }
    }

    return path.join('');
  }

  getRobotInstructions(buttonStr) {
    const sequence = ['A', ...buttonStr];
    let result = '';
    for (let i = 1; i < sequence.length; i++) {
      // Path from the previous button to the current one, then activate it
      result += `${this.getButtonPath(sequence[i - 1], sequence[i])}A`;
    }

    return result;
  }
}

class RobotChain {
  #doorKeypad;
  #remoteKeypad;
  #doorCodes;

  constructor(doorCodes) {
    this.#doorKeypad = new Keypad(DOOR_KEYPAD);
    this.#remoteKeypad = new Keypad(REMOTE_KEYPAD);

    this.#doorCodes = doorCodes.split('\n').filter((line) => line.length > 0);
  }

  #getCodeComplexity(code, extraRobotCount) {
    const paths = new Map();
    const doorInstructions = this.#doorKeypad.getRobotInstructions(code);

    /* The keys in the paths map are each a single motion of the robot arm,
     * represented as a two-character sequence (e.g. '^>'). With each
     * iteration, the path between each of these sequences is broken down into
     * motions and the number of times each motion occurs is stored in the map
     * or updated. */
    const updatePaths = (path, multiplier, depth) => {
      /* Add an 'A' at the beginning since the arm starts every motion from the
       * A button. */
      const movement = `A${path}`;

      // Evaluate each pair of buttons in the path
      for (let i = 0; i + 1 < movement.length; i++) {
        let key = movement.slice(i, i + 2);

        /* Moving from a key to itself is always the same motion, so no need
         * to store separate paths for each button. */
        if (movement[i] === movement[i + 1]) key = 'AA';

        let pathInfo = paths.get(key);
        if (pathInfo == null) {
          pathInfo = {
            // Instructions for the next robot in the chain
            instructions: `${this.#remoteKeypad.getButtonPath(
              movement[i],
              movement[i + 1],
            )}A`,
            count: 0, // How many times the button pair occurs at this depth
            prevCount: 0, // How many times the pair occurred at previous depth
            depth, // The last depth at which the pair occurred
          };

          paths.set(key, pathInfo);
        }

        if (pathInfo.depth < depth) {
          if (pathInfo.depth === depth - 1) pathInfo.prevCount = pathInfo.count;
          else pathInfo.prevCount = 0;

          pathInfo.depth = depth;
          pathInfo.count = 0;
        }
        pathInfo.count += multiplier;
      }
    };

    // Store the initial button paths resulting from the door code
    updatePaths(doorInstructions, 1, 0);

    for (let depth = 1; depth <= extraRobotCount; depth++) {
      // For each button-pair in the map, evaluate the path between the buttons
      [...paths.values()].forEach((pathInfo) => {
        let prevCount = 0;
        if (pathInfo.depth === depth - 1) prevCount = pathInfo.count;
        else if (pathInfo.depth === depth) prevCount = pathInfo.prevCount;
        updatePaths(pathInfo.instructions, prevCount, depth);
      });
    }

    /* The number of keys in the map determines the number of pairs of buttons
     * in the sequence, which would be one fewer than the actual sequence
     * length. However, since there is always one extra key present due to the
     * initial motion of the robot arm, the length returned is actually correct
     * as is. */
    const sequenceLength = [...paths.values()].reduce((length, pathInfo) => {
      if (pathInfo.depth < extraRobotCount) return length;
      return length + pathInfo.count;
    }, 0);

    return Number.parseInt(code, 10) * sequenceLength;
  }

  getTotalComplexity(extraRobotCount = 2) {
    return this.#doorCodes.reduce(
      (sum, code) => sum + this.#getCodeComplexity(code, extraRobotCount),
      0,
    );
  }
}

export default function run(input) {
  const robots = new RobotChain(input);

  return [robots.getTotalComplexity(2), robots.getTotalComplexity(25)];
}
