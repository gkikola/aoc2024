class Disk {
  #image;

  constructor(map) {
    this.#buildImage(map);
  }

  #buildImage(map) {
    const diskImage = [];
    let fileId = 0;
    for (let i = 0; i < map.length; i++) {
      if (map[i] === '\n') break;
      const parsedValue = Number.parseInt(map[i], 10);

      for (let j = 0; j < parsedValue; j++) {
        diskImage.push(i % 2 === 0 ? fileId : null);
      }

      if (i % 2 === 0) fileId++;
    }

    this.#image = diskImage;
  }

  defragmentByBlock() {
    if (this.#image.length === 0) return;
    let insertIndex = 0;
    let moveIndex = this.#image.length - 1;
    while (moveIndex > insertIndex) {
      if (this.#image[moveIndex] !== null) {
        while (this.#image[insertIndex] !== null && insertIndex < moveIndex) {
          insertIndex++;
        }
        if (insertIndex >= moveIndex) break;

        this.#image[insertIndex] = this.#image[moveIndex];
        this.#image[moveIndex] = null;
        insertIndex++;
      }

      moveIndex--;
    }
  }

  #findFileStart(end) {
    if (this.#image[end] === null) return -1;

    const fileId = this.#image[end];
    let result = end;

    while (result > 0) {
      if (this.#image[result - 1] === fileId) result--;
      else return result;
    }

    return result;
  }

  #findFreeSpace(start, end, minSize) {
    let result = 0;
    let curSize = 0;
    for (let i = start; i <= end; i++) {
      if (this.#image[i] === null) {
        if (curSize === 0) result = i;
        curSize++;
      } else {
        curSize = 0;
      }

      if (curSize >= minSize) return result;
    }

    return -1;
  }

  #moveBlocks(source, dest, length) {
    for (let i = 0; i < length; i++) {
      this.#image[dest + i] = this.#image[source + i];
      this.#image[source + i] = null;
    }
  }

  defragmentByFile() {
    if (this.#image.length === 0) return;

    let position = this.#image.length - 1;
    while (position > 0) {
      const fileId = this.#image[position];
      if (fileId !== null) {
        const fileEnd = position;
        position = this.#findFileStart(position);
        const fileLength = fileEnd - position + 1;
        const destination = this.#findFreeSpace(0, position - 1, fileLength);

        if (destination >= 0) {
          this.#moveBlocks(position, destination, fileLength);
        }
      }

      position--;
    }
  }

  get checksum() {
    return this.#image.reduce((sum, value, index) => {
      if (value !== null) return sum + value * index;
      return sum;
    }, 0);
  }
}

export default function run(input) {
  const disk1 = new Disk(input);
  const disk2 = new Disk(input);

  disk1.defragmentByBlock();
  disk2.defragmentByFile();

  return [disk1.checksum, disk2.checksum];
}
