function parseInput(stoneStr) {
  return stoneStr
    .split(' ')
    .filter((c) => c !== '\n')
    .map((c) => Number.parseInt(c, 10));
}

function countDigits(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(n) + 1);
}

function splitDigits(n, digitCount) {
  const leftHalf = Math.floor(n / 10 ** (digitCount / 2));
  const rightHalf = n % 10 ** (digitCount / 2);
  return [leftHalf, rightHalf];
}

function countStones(stones, iterations, resultCache = null) {
  // Cache maps iteration count to a map that maps values to stone counts
  const cache = resultCache ?? new Map();

  if (iterations <= 0) return stones.length;
  if (stones.length === 0) return 0;
  if (stones.length === 1) {
    const [value] = stones;
    let iterCache = cache.get(iterations);
    if (iterCache && iterCache.has(value)) return iterCache.get(value);

    let count = 0;
    if (value === 0) {
      count = countStones([1], iterations - 1, cache);
    } else {
      const digitCount = countDigits(value);
      if (digitCount % 2 === 0) {
        count = countStones(
          splitDigits(value, digitCount),
          iterations - 1,
          cache,
        );
      } else {
        count = countStones([value * 2024], iterations - 1, cache);
      }
    }

    if (!iterCache) {
      iterCache = new Map();
      cache.set(iterations, iterCache);
    }
    iterCache.set(value, count);
    return count;
  }

  // More than one stone
  return stones.reduce(
    (count, value) => count + countStones([value], iterations, cache),
    0,
  );
}

export default function run(input) {
  return [
    countStones(parseInput(input), 25),
    countStones(parseInput(input), 75),
  ];
}
