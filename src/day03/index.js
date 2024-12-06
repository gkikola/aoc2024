export default function run(input) {
  const matches = input.matchAll(/mul\(([0-9]{1,3}),([0-9]{1,3})\)/g);
  let sum = 0;

  for (const match of matches) {
    const value1 = Number.parseInt(match[1], 10);
    const value2 = Number.parseInt(match[2], 10);
    sum += value1 * value2;
  }

  return sum;
}
