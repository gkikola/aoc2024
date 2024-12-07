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

  const middleSum = updateInput.split('\n').reduce((sum, line) => {
    if (line.length === 0) return sum;

    const sequence = splitAndConvert(line, ',');
    if (pageOrder.isPageUpdateValid(sequence)) {
      return sum + middleValue(sequence);
    }

    return sum;
  }, 0);

  return middleSum;
}
