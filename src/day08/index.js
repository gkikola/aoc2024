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

  #addAntinodes(antinodes, antennas) {
    if (antennas.length < 2) return;

    const [firstX, firstY] = this.#indexToCoords(antennas[0]);
    const rest = antennas.slice(1);

    rest.forEach((secondAntenna) => {
      const [secondX, secondY] = this.#indexToCoords(secondAntenna);

      const deltaX = secondX - firstX;
      const deltaY = secondY - firstY;

      const location1 = [firstX - deltaX, firstY - deltaY];
      const location2 = [secondX + deltaX, secondY + deltaY];

      [location1, location2].forEach((location) => {
        if (this.#isPositionInBounds(location)) {
          antinodes.add(this.#coordsToIndex(location));
        }
      });
    });

    this.#addAntinodes(antinodes, rest);
  }

  countAntinodes() {
    const antinodes = new Set();

    for (const frequency of this.#antennas.keys()) {
      this.#addAntinodes(antinodes, this.#antennas.get(frequency));
    }

    return antinodes.size;
  }
}

export default function run(input) {
  const city = new City(input);
  return city.countAntinodes();
}
