class AreaMap {
  #map;
  #width;
  #height;

  constructor(mapStr) {
    this.#buildMap(mapStr);
  }

  #coordsToIndex(x, y) {
    return y * this.#width + x;
  }

  #buildMap(mapStr) {
    this.#width = mapStr.indexOf('\n');
    this.#height = Math.floor(mapStr.length / (this.#width + 1));
    this.#map = Array.from(mapStr)
      .filter((c) => c !== '\n')
      .map((heightStr) => Number.parseInt(heightStr, 10));
  }

  #isPositionValid(x, y) {
    return x >= 0 && y >= 0 && x < this.#width && y < this.#height;
  }

  heightAt(x, y) {
    if (!this.#isPositionValid(x, y)) return null;
    return this.#map[this.#coordsToIndex(x, y)];
  }

  #computeValue(x, y, rating = false, visited = new Set()) {
    if (!rating) {
      if (visited.has(this.#coordsToIndex(x, y))) return 0;
      visited.add(this.#coordsToIndex(x, y));
    }

    if (this.heightAt(x, y) === 9) return 1;

    const directions = [
      [-1, 0],
      [0, -1],
      [0, 1],
      [1, 0],
    ];
    const targetHeight = this.heightAt(x, y) + 1;

    return directions
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(
        ([checkX, checkY]) => this.heightAt(checkX, checkY) === targetHeight,
      )
      .reduce(
        (sum, [checkX, checkY]) =>
          sum + this.#computeValue(checkX, checkY, rating, visited),
        0,
      );
  }

  #computeTotalValue(rating = false) {
    let value = 0;
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        if (this.heightAt(x, y) === 0) {
          value += this.#computeValue(x, y, rating);
        }
      }
    }
    return value;
  }

  computeTotalTrailheadScore() {
    return this.#computeTotalValue(false);
  }

  computeTotalTrailheadRating() {
    return this.#computeTotalValue(true);
  }
}

export default function run(input) {
  const map = new AreaMap(input);

  return [map.computeTotalTrailheadScore(), map.computeTotalTrailheadRating()];
}
