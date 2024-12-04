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
  let totalDistance = 0;
  for (let i = 0; i < sorted1.length; i += 1) {
    totalDistance += Math.abs(sorted1[i] - sorted2[i]);
  }

  return totalDistance;
}

function calculateSimilarity(list1, list2) {
  let similarity = 0;
  const counts = new Map();

  list2.forEach((value) => {
    const count = counts.get(value) ?? 0;
    counts.set(value, count + 1);
  });

  list1.forEach((value) => {
    const count = counts.get(value) ?? 0;
    similarity += value * count;
  });

  return similarity;
}

export default function run(input) {
  const { list1, list2 } = parseInput(input);

  list1.sort();
  list2.sort();

  return [calculateDistance(list1, list2), calculateSimilarity(list1, list2)];
}
