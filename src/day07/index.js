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

function isEquationValid(result, operands, operators) {
  if (operands.length === 0) return false;

  for (let i = 0; i < operators.length ** (operands.length - 1); i++) {
    let trialResult = operands[0];

    for (let j = 0; j < operands.length - 1; j++) {
      const opIndex = Math.floor(i / operators.length ** j) % operators.length;
      trialResult = calculate(operators[opIndex], trialResult, operands[j + 1]);

      if (trialResult > result) break;
    }

    if (trialResult === result) return true;
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

    if (isEquationValid(result, operands, ['+', '*'])) {
      simpleCalibrationResult += result;
      finalCalibrationResult += result;
    } else if (isEquationValid(result, operands, ['||', '+', '*'])) {
      finalCalibrationResult += result;
    }
  });

  return [simpleCalibrationResult, finalCalibrationResult];
}
