const ITERATIONS = 2000;

class SecretGenerator {
  #seeds;
  #priceChanges;
  #secretSum;

  constructor(seeds) {
    this.#seeds = seeds
      .split('\n')
      .filter((value) => value.length > 0)
      .map((value) => Number.parseInt(value, 10));
    this.#priceChanges = new Map();
    this.#secretSum = 0;
  }

  static #getPriceChangeKey(sequence) {
    // Price changes can be between -9 and 9, for a total of 19 possible values
    return sequence.reduce((key, value) => key * 19 + value + 9, 0);
  }

  #computeNthSecret(secret) {
    const sequencesSeen = new Set();
    const lastFourChanges = [];
    let previous = secret % 10;
    let result = secret;
    for (let i = 0; i < ITERATIONS; i++) {
      result = SecretGenerator.nextSecret(result);

      lastFourChanges.push((result % 10) - previous);
      if (lastFourChanges.length > 4) lastFourChanges.shift();
      if (lastFourChanges.length === 4) {
        // If this is a new sequence for this seed, then update the map
        const key = SecretGenerator.#getPriceChangeKey(lastFourChanges);
        if (!sequencesSeen.has(key)) {
          let totalBananas = this.#priceChanges.get(key);
          if (totalBananas == null) totalBananas = 0;

          this.#priceChanges.set(key, totalBananas + (result % 10));
          sequencesSeen.add(key);
        }
      }
      previous = result % 10;
    }
    return result;
  }

  static nextSecret(secret) {
    /* eslint-disable no-bitwise */
    const pruneMask = (1 << 24) - 1;
    const mix = (a, b) => a ^ b;
    const prune = (value) => value & pruneMask;

    let result = secret;
    result = prune(mix(result << 6, result));
    result = mix(result >> 5, result); // Prune has no effect here
    result = prune(mix(result << 11, result));

    return Number(result);
    /* eslint-enable no-bitwise */
  }

  sumNthSecrets() {
    if (this.#secretSum > 0) return this.#secretSum;

    this.#secretSum = this.#seeds.reduce(
      (sum, secret) => sum + this.#computeNthSecret(secret),
      0,
    );
    return this.#secretSum;
  }

  getMaxBananas() {
    if (this.#priceChanges.size === 0) this.sumNthSecrets();

    let max = 0;

    this.#priceChanges.forEach((value) => {
      if (value > max) max = value;
    });

    return max;
  }
}

export default function run(input) {
  const generator = new SecretGenerator(input);

  return [generator.sumNthSecrets(), generator.getMaxBananas()];
}
