class DesignCounter {
  #patterns;
  #designs;
  #cache;

  #possibleCount;
  #arrangementCount;

  constructor(towelData) {
    const [patternLine, designList] = towelData.split('\n\n');
    this.#patterns = new Set(patternLine.split(', '));
    this.#designs = designList
      .split('\n')
      .filter((design) => design.length > 0);
    this.#cache = new Map();

    this.#possibleCount = null;
    this.#arrangementCount = null;
  }

  countArrangements(design) {
    if (this.#cache.has(design)) return this.#cache.get(design);

    let count = 0;
    for (let i = 1; i <= design.length; i++) {
      // If the start of the design matches, recursively test the rest of it
      if (this.#patterns.has(design.slice(0, i))) {
        if (i === design.length) {
          count++;
        } else {
          const substrCount = this.countArrangements(design.slice(i));
          if (substrCount > 0) count += substrCount;
        }
      }
    }

    this.#cache.set(design, count);
    return count;
  }

  #updateCounts() {
    this.#possibleCount = 0;
    this.#arrangementCount = 0;
    this.#designs.forEach((design) => {
      const count = this.countArrangements(design);
      if (count > 0) this.#possibleCount++;
      this.#arrangementCount += count;
    });
  }

  countPossibleDesigns() {
    if (this.#possibleCount == null) this.#updateCounts();

    return this.#possibleCount;
  }

  countTotalArrangements() {
    if (this.#arrangementCount == null) this.#updateCounts();

    return this.#arrangementCount;
  }
}

export default function run(input) {
  const counter = new DesignCounter(input);
  return [counter.countPossibleDesigns(), counter.countTotalArrangements()];
}
