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
}

export default function run(input) {
  const wordSearch = new WordSearch(input);

  return wordSearch.wordCount('XMAS');
}
