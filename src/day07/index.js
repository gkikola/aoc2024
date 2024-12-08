function calculate(operator, a, b) {
  switch (operator) {
    case '+':
      return a + b;
    case '*':
      return a * b;
    case '||':
      return a * 10 ** Math.floor(Math.log10(b) + 1) + b;
    default:
      throw new Error(`Unexpected operator '${operator}'.`);
  }
}

function isEquationValid(target, operands, operators, runningTotal = null) {
  if (operands.length === 0) return runningTotal === target;
  if (runningTotal !== null && runningTotal > target) return false;

  for (const op of operators) {
    const newTotal =
      runningTotal === null
        ? operands[0]
        : calculate(op, runningTotal, operands[0]);
    if (isEquationValid(target, operands.slice(1), operators, newTotal)) {
      return true;
    }
  }

  return false;
}

export default function run(input) {
  let simpleCalibrationResult = 0;
  let finalCalibrationResult = 0;

  input.split('\n').forEach((line) => {
    if (line.length === 0) return;
    const [resultStr, operandStr] = line.split(': ');

    const result = Number.parseInt(resultStr, 10);
    const operands = operandStr
      .split(' ')
      .map((value) => Number.parseInt(value, 10));

    if (isEquationValid(result, operands, ['*', '+'])) {
      simpleCalibrationResult += result;
      finalCalibrationResult += result;
    } else if (isEquationValid(result, operands, ['||', '*', '+'])) {
      finalCalibrationResult += result;
    }
  });

  return [simpleCalibrationResult, finalCalibrationResult];
}
