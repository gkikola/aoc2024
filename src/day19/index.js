class DesignCounter {
  #patterns;
  #designs;
  #cache;

  constructor(towelData) {
    const [patternLine, designList] = towelData.split('\n\n');
    this.#patterns = new Set(patternLine.split(', '));
    this.#designs = designList
      .split('\n')
      .filter((design) => design.length > 0);
    this.#cache = new Map();
  }

  testDesign(design) {
    if (design.length === 0) return true;
    if (this.#cache.has(design)) return this.#cache.get(design);

    for (let i = 1; i <= design.length; i++) {
      // If the start of the design matches, recursively test the rest of it
      if (
        this.#patterns.has(design.slice(0, i)) &&
        this.testDesign(design.slice(i))
      ) {
        this.#cache.set(design, true);
        return true;
      }
    }

    this.#cache.set(design, false);
    return false;
  }

  countPossibleDesigns() {
    return this.#designs.reduce((count, design) => {
      if (this.testDesign(design)) return count + 1;
      return count;
    }, 0);
  }
}

export default function run(input) {
  const counter = new DesignCounter(input);
  return counter.countPossibleDesigns();
}
