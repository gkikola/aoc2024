class City {
  static #antennaSymbol = /[A-Za-z0-9]/;
  #antennas;
  #width;
  #height;

  constructor(map) {
    this.#width = map.indexOf('\n');
    this.#height = Math.floor(map.length / (this.#width + 1));

    this.#buildAntennaList(map);
  }

  #coordsToIndex(position) {
    return position[1] * this.#width + position[0];
  }

  #indexToCoords(index) {
    return [index % this.#width, Math.floor(index / this.#width)];
  }

  #isPositionInBounds(position) {
    const [x, y] = position;
    return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
  }

  #buildAntennaList(mapString) {
    this.#antennas = new Map();

    let index = 0;
    for (const c of mapString) {
      if (City.#antennaSymbol.test(c)) {
        let indexList;
        if (!this.#antennas.has(c)) {
          indexList = [];
          this.#antennas.set(c, indexList);
        } else {
          indexList = this.#antennas.get(c);
        }
        indexList.push(index);
      }

      if (c !== '\n') index++;
    }
  }

  #getAntinodePositions(antenna1, antenna2, distanceMultiple, deltaMultiple) {
    const [firstX, firstY] = this.#indexToCoords(antenna1);
    const [secondX, secondY] = this.#indexToCoords(antenna2);

    const deltaX = secondX - firstX;
    const deltaY = secondY - firstY;

    const getOffset = (multiple) => [
      firstX + deltaX * multiple,
      firstY + deltaY * multiple,
    ];

    const start = getOffset(distanceMultiple);
    if (!this.#isPositionInBounds(start)) return [];

    const positions = [start];
    if (deltaMultiple === 0) return positions;

    for (
      let multiple = distanceMultiple + deltaMultiple;
      ;
      multiple += deltaMultiple
    ) {
      const position = getOffset(multiple);
      if (this.#isPositionInBounds(position)) positions.push(position);
      else break;
    }

    return positions;
  }

  #addAntinodes(antinodes, antennas, withResonance = false) {
    if (antennas.length < 2) return;

    const [antenna1] = antennas;
    const rest = antennas.slice(1);

    rest.forEach((antenna2) => {
      const newPositions = [];

      if (withResonance) {
        // Start at first antenna and go backwards
        // Then start at second antenna and go forwards
        newPositions.push(
          ...this.#getAntinodePositions(antenna1, antenna2, 0, -1),
        );
        newPositions.push(
          ...this.#getAntinodePositions(antenna1, antenna2, 1, 1),
        );
      } else {
        // Two antinode locations are one offset before first antenna
        // and two offsets after first antenna
        newPositions.push(
          ...this.#getAntinodePositions(antenna1, antenna2, -1, 0),
        );
        newPositions.push(
          ...this.#getAntinodePositions(antenna1, antenna2, 2, 0),
        );
      }

      newPositions.forEach((position) => {
        antinodes.add(this.#coordsToIndex(position));
      });
    });

    this.#addAntinodes(antinodes, rest, withResonance);
  }

  countAntinodes(withResonance = false) {
    const antinodes = new Set();

    for (const frequency of this.#antennas.keys()) {
      this.#addAntinodes(
        antinodes,
        this.#antennas.get(frequency),
        withResonance,
      );
    }

    return antinodes.size;
  }
}

export default function run(input) {
  const city = new City(input);
  return [city.countAntinodes(), city.countAntinodes(true)];
}
