class PageOrder {
  #rules;

  constructor() {
    this.#rules = new Map();
  }

  addRule(predecessor, successor) {
    if (this.#rules.has(predecessor)) {
      this.#rules.get(predecessor).add(successor);
    } else {
      this.#rules.set(predecessor, new Set([successor]));
    }
  }

  isPairValid(predecessor, successor) {
    const invalidPredecessors = this.#rules.get(successor);

    if (!invalidPredecessors) return true;

    return !invalidPredecessors.has(predecessor);
  }

  isPageUpdateValid(pageSequence) {
    for (let i = 0; i < pageSequence.length - 1; i++) {
      for (let j = i + 1; j < pageSequence.length; j++) {
        if (!this.isPairValid(pageSequence[i], pageSequence[j])) return false;
      }
    }

    return true;
  }

  fixPageUpdate(pageSequence) {
    const correctedSequence = [...pageSequence];
    let sequenceChanged = false;

    for (let i = 0; i < correctedSequence.length - 1; i++) {
      for (let j = i + 1; j < correctedSequence.length; j++) {
        if (!this.isPairValid(correctedSequence[i], correctedSequence[j])) {
          // Shift element j to the current position, and restart outer loop
          const shiftedValue = correctedSequence[j];
          for (let k = j; k > i; k--) {
            correctedSequence[k] = correctedSequence[k - 1];
          }
          correctedSequence[i] = shiftedValue;
          sequenceChanged = true;
          i--;
          break;
        }
      }
    }

    return { sequenceChanged, correctedSequence };
  }
}

function splitAndConvert(line, delimiter) {
  return line.split(delimiter).map((value) => Number.parseInt(value, 10));
}

function middleValue(pageSequence) {
  return pageSequence[Math.floor(pageSequence.length / 2)];
}

export default function run(input) {
  const pageOrder = new PageOrder();
  const [ruleInput, updateInput] = input.split('\n\n');

  ruleInput.split('\n').forEach((rule) => {
    if (rule.length === 0) return;
    pageOrder.addRule(...splitAndConvert(rule, '|'));
  });

  let middleSumCorrect = 0;
  let middleSumIncorrect = 0;
  updateInput.split('\n').forEach((line) => {
    if (line.length === 0) return;

    const sequence = splitAndConvert(line, ',');
    const result = pageOrder.fixPageUpdate(sequence);
    if (result.sequenceChanged) {
      // Update was fixed
      middleSumIncorrect += middleValue(result.correctedSequence);
    } else {
      // Update was already correct
      middleSumCorrect += middleValue(sequence);
    }
  });

  return [middleSumCorrect, middleSumIncorrect];
}
