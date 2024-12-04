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

function calculateSimilarity(sorted1, sorted2) {
  let similarity = 0;

  /* Since the arrays are sorted, we use minRightIndex to keep track of
   * the smallest start value in the right-hand list in order to save
   * some time in the inner loop. */
  for (let i = 0, minRightIndex = 0; i < sorted1.length; i += 1) {
    const lvalue = sorted1[i];

    let count = 0;
    for (let j = minRightIndex; j < sorted2.length; j += 1) {
      const rvalue = sorted2[j];

      if (lvalue < rvalue) {
        // The value is not in the right-hand list
        break;
      } else if (lvalue === rvalue) {
        count += 1;
      } else {
        minRightIndex += 1;
      }
    }

    similarity += lvalue * count;
  }

  return similarity;
}

export default function run(input) {
  const { list1, list2 } = parseInput(input);

  list1.sort();
  list2.sort();

  return [calculateDistance(list1, list2), calculateSimilarity(list1, list2)];
}
