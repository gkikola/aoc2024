function computeMachineCost(
  offsetA,
  offsetB,
  prizeLocation,
  correctiveOffset = 0,
) {
  const [aX, aY] = offsetA;
  const [bX, bY] = offsetB;
  const [prizeX, prizeY] = [
    prizeLocation[0] + correctiveOffset,
    prizeLocation[1] + correctiveOffset,
  ];

  // Cramer's Rule
  const determinant = aX * bY - aY * bX;
  if (determinant === 0) return 0;

  const aCount = (prizeX * bY - prizeY * bX) / determinant;
  const bCount = (prizeY * aX - prizeX * aY) / determinant;

  if (!Number.isInteger(aCount) || !Number.isInteger(bCount)) return 0;

  return 3 * aCount + bCount;
}

export default function run(input) {
  const matchExp = /(Button [AB]|Prize): X[+=](\d+), Y[+=](\d+)/;
  const CORRECTIVE_OFFSET = 10 ** 13;
  let totalCost = 0;
  let totalCorrectedCost = 0;

  input.split('\n\n').forEach((machineInfo) => {
    const data = machineInfo
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => {
        const matchResult = line.match(matchExp);
        return [
          Number.parseInt(matchResult[2], 10),
          Number.parseInt(matchResult[3], 10),
        ];
      });

    if (data.length === 3) {
      totalCost += computeMachineCost(...data);
      totalCorrectedCost += computeMachineCost(...data, CORRECTIVE_OFFSET);
    }
  });

  return [totalCost, totalCorrectedCost];
}
