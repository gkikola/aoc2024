const DOOR_KEYPAD = '789\n456\n123\n 0A';
const REMOTE_KEYPAD = ' ^A\n<v>';

class Keypad {
  #buttons;
  #labelLookup;
  #width;
  #height;

  constructor(layout) {
    this.#width = layout.indexOf('\n');
    this.#height = Math.ceil(layout.length / (this.#width + 1));
    this.#buttons = [...layout].filter((label) => label !== '\n');
    this.#labelLookup = new Map();
    this.#buttons.forEach((label, index) => {
      this.#labelLookup.set(label, index);
    });
  }

  #buttonAt(x, y) {
    return this.#buttons[y * this.#width + x];
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

      // Down movements are next
      if (posY < endY && (gapX !== posX || gapY > endY || gapY < posY)) {
        for (; posY < endY; posY++) path.push('v');
      }

      // Right movements
      if (posX < endX && (gapY !== posY || gapX > endX || gapX < posX)) {
        for (; posX < endX; posX++) path.push('>');
      }

      // Up movements
      if (posY > endY && (gapX !== posX || gapY < endY || gapY > posY)) {
        for (; posY > endY; posY--) path.push('^');
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

export default function run(input) {
  const door = new Keypad(DOOR_KEYPAD);
  const remote1 = new Keypad(REMOTE_KEYPAD);
  const remote2 = new Keypad(REMOTE_KEYPAD);

  return input
    .split('\n')
    .filter((line) => line.length > 0)
    .reduce(
      (complexity, code) =>
        complexity +
        remote2.getRobotInstructions(
          remote1.getRobotInstructions(door.getRobotInstructions(code)),
        ).length *
          Number.parseInt(code, 10),
      0,
    );
}
