function getDiskImage(diskMap) {
  const diskImage = [];
  let fileId = 0;
  for (let i = 0; i < diskMap.length; i++) {
    if (diskMap[i] === '\n') break;
    const parsedValue = Number.parseInt(diskMap[i], 10);

    for (let j = 0; j < parsedValue; j++) {
      diskImage.push(i % 2 === 0 ? fileId : null);
    }

    if (i % 2 === 0) fileId++;
  }

  return diskImage;
}

function defragmentBlocks(diskImage) {
  if (diskImage.length === 0) return diskImage;

  const result = diskImage;
  let insertIndex = 0;
  let moveIndex = diskImage.length - 1;
  while (moveIndex > insertIndex) {
    if (diskImage[moveIndex] !== null) {
      while (diskImage[insertIndex] !== null && insertIndex < moveIndex) {
        insertIndex++;
      }
      if (insertIndex >= moveIndex) break;

      result[insertIndex] = result[moveIndex];
      result[moveIndex] = null;
    }

    moveIndex--;
  }

  return result;
}

function diskChecksum(diskImage) {
  return diskImage.reduce((sum, value, index) => {
    if (value !== null) return sum + value * index;
    return sum;
  }, 0);
}

export default function run(input) {
  const image = getDiskImage(input);
  return diskChecksum(defragmentBlocks(image));
}
