export default function run(input) {
  const matches = input.matchAll(
    /((mul\(([0-9]{1,3}),([0-9]{1,3})\))|do\(\)|don't\(\))/g,
  );
  let sum = 0;
  let conditionalSum = 0;
  let mulEnabled = true;

  for (const match of matches) {
    switch (match[1].slice(0, 3)) {
      case 'mul':
        {
          const value1 = Number.parseInt(match[3], 10);
          const value2 = Number.parseInt(match[4], 10);
          sum += value1 * value2;
          if (mulEnabled) conditionalSum += value1 * value2;
        }
        break;
      case 'do(':
        mulEnabled = true;
        break;
      case 'don':
        mulEnabled = false;
        break;
      default:
        break;
    }
  }

  return [sum, conditionalSum];
}
