function parseInput(input) {
  const list1 = [];
  const list2 = [];

  input.split('\n').forEach((line) => {
    const splitLine = line.split(' ').filter((str) => str.length > 0);

    if (splitLine.length >= 2) {
      list1.push(Number.parseInt(splitLine[0], 10));
      list2.push(Number.parseInt(splitLine[1], 10));
    }
  });

  return { list1, list2 };
}

function calculateDistance(sorted1, sorted2) {
  return sorted1.reduce(
    (distanceSum, leftValue, index) =>
      distanceSum + Math.abs(leftValue - sorted2[index]),
    0,
  );
}

function calculateSimilarity(list1, list2) {
  const counts = new Map();

  list2.forEach((value) => {
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
  });

  return list1.reduce((similarity, value) => {
    const count = counts.get(value) ?? 0;
    return similarity + value * count;
  }, 0);
}

export default function run(input) {
  const { list1, list2 } = parseInput(input);

  list1.sort();
  list2.sort();

  return [calculateDistance(list1, list2), calculateSimilarity(list1, list2)];
}
