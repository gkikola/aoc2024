class WordSearch {
  #content;
  #width;
  #height;

  constructor(content) {
    this.#content = content;
    this.#width = content.indexOf('\n');
    this.#height = Math.floor(content.length / (this.#width + 1));
  }

  at(x, y) {
    if (x < 0 || x >= this.#width || y < 0 || y >= this.#height) {
      return null;
    }

    return this.#content[y * (this.#width + 1) + x];
  }

  #checkWord(x, y, word, deltaX, deltaY) {
    let index = 0;
    let curX = x;
    let curY = y;

    while (index < word.length) {
      if (this.at(curX, curY) !== word[index]) return false;

      index++;
      curX += deltaX;
      curY += deltaY;
    }

    return true;
  }

  wordCountAt(x, y, word) {
    let count = 0;

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    directions.forEach((direction) => {
      if (this.#checkWord(x, y, word, direction[0], direction[1])) {
        count++;
      }
    });

    return count;
  }

  wordCount(word) {
    let count = 0;

    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        count += this.wordCountAt(x, y, word);
      }
    }

    return count;
  }

  #checkXFormation(x, y, word) {
    const checks = [
      { offsetX: -1, offsetY: 1, deltaX: 1, deltaY: -1 },
      { offsetX: -1, offsetY: -1, deltaX: 1, deltaY: 1 },
    ];

    let count = 0;
    checks.forEach((check) => {
      // Check for word forwards or backwards
      if (
        this.#checkWord(
          x + check.offsetX,
          y + check.offsetY,
          word,
          check.deltaX,
          check.deltaY,
        ) ||
        this.#checkWord(
          x - check.offsetX,
          y - check.offsetY,
          word,
          -check.deltaX,
          -check.deltaY,
        )
      ) {
        count++;
      }
    });

    return count === 2;
  }

  xFormationCount(word) {
    if (word.length !== 3) {
      throw new Error('Word in X-formation must have three characters');
    }

    let count = 0;

    for (let y = 1; y + 1 < this.#height; y++) {
      for (let x = 1; x + 1 < this.#width; x++) {
        if (this.#checkXFormation(x, y, word)) count++;
      }
    }

    return count;
  }
}

export default function run(input) {
  const wordSearch = new WordSearch(input);

  return [wordSearch.wordCount('XMAS'), wordSearch.xFormationCount('MAS')];
}
