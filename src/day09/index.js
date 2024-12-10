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
    let insertIndex = 0; // Where to insert the file block
    let moveIndex = this.#image.length - 1; // Where to move the file from
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

  #moveBlocks(source, dest, length) {
    for (let i = 0; i < length; i++) {
      this.#image[dest + i] = this.#image[source + i];
      this.#image[source + i] = null;
    }
  }

  defragmentByFile() {
    if (this.#image.length === 0) return;

    // Store list of files and contiguous empty spaces for easy lookup
    const fileMap = new Map();
    const freeSpaceList = [];

    let curFile = this.#image[0];
    let blockCount = 1;
    for (let i = 1; i < this.#image.length; i++) {
      const fileId = this.#image[i];

      if (fileId === curFile) {
        blockCount++;
      } else {
        const blockInfo = { start: i - blockCount, size: blockCount };
        if (curFile === null) freeSpaceList.push(blockInfo);
        else fileMap.set(curFile, blockInfo);

        curFile = fileId;
        blockCount = 1;
      }
    }

    const lastBlockInfo = {
      start: this.#image.length - blockCount,
      size: blockCount,
    };
    if (curFile === null) freeSpaceList.push(lastBlockInfo);
    else fileMap.set(curFile, lastBlockInfo);

    if (fileMap.size === 0 || freeSpaceList.length === 0) return;

    // Move each file in reverse order to the first available space
    for (let i = fileMap.size - 1; i >= 0; i--) {
      const fileInfo = fileMap.get(i);
      for (const spaceInfo of freeSpaceList) {
        if (spaceInfo.start > fileInfo.start) break;
        if (fileInfo.size <= spaceInfo.size) {
          this.#moveBlocks(fileInfo.start, spaceInfo.start, fileInfo.size);
          spaceInfo.start += fileInfo.size;
          spaceInfo.size -= fileInfo.size;
          break;
        }
      }
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
