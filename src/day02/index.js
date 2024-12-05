function isSafe(report) {
  let minDiff;
  let maxDiff;
  for (let i = 1; i < report.length; i++) {
    const difference = report[i] - report[i - 1];

    if (i === 1) {
      minDiff = difference > 0 ? 1 : -3;
      maxDiff = difference > 0 ? 3 : -1;
    }

    if (difference < minDiff || difference > maxDiff) return false;
  }

  return true;
}

function isSafeWithDampener(report) {
  for (let i = 0; i < report.length; i++) {
    if (isSafe(report.toSpliced(i, 1))) return true;
  }

  return false;
}

export default function run(input) {
  const reports = input
    .split('\n')
    .filter((report) => report.length > 0)
    .map((report) =>
      report.split(' ').map((level) => Number.parseInt(level, 10)),
    );

  let safeCount = 0;
  let safeWithDampenerCount = 0;

  reports.forEach((report) => {
    if (isSafe(report)) {
      safeCount++;
      safeWithDampenerCount++;
    } else if (isSafeWithDampener(report)) {
      safeWithDampenerCount++;
    }
  });

  return [safeCount, safeWithDampenerCount];
}
