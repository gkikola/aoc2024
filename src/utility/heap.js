function defaultCompare(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export default class Heap {
  #heapArr;
  #compareFn;

  static #leftChild(index) {
    return index * 2 + 1;
  }

  static #rightChild(index) {
    return index * 2 + 2;
  }

  static #parent(index) {
    return Math.floor((index - 1) / 2);
  }

  #isInBounds(index) {
    return index >= 0 && index < this.size;
  }

  #isLeaf(index) {
    return Heap.#leftChild(index) >= this.size;
  }

  #at(index) {
    return this.#heapArr[index];
  }

  #swap(index1, index2) {
    const temp = this.#heapArr[index1];
    this.#heapArr[index1] = this.#heapArr[index2];
    this.#heapArr[index2] = temp;
  }

  #indexOf(value, start = 0) {
    return this.#heapArr.indexOf(value, start);
  }

  constructor(compareFn = defaultCompare) {
    this.#heapArr = [];
    this.#compareFn = compareFn;
  }

  #swimValueAt(index) {
    let position = index;
    while (position > 0) {
      const parentPos = Heap.#parent(position);
      if (this.#compareFn(this.#at(parentPos), this.#at(position)) > 0) {
        this.#swap(parentPos, position);
        position = parentPos;
      } else {
        break;
      }
    }

    return position;
  }

  #sinkValueAt(index) {
    let position = index;
    while (!this.#isLeaf(position)) {
      const leftPos = Heap.#leftChild(position);
      const rightPos = Heap.#rightChild(position);
      const leftVal = this.#at(leftPos);
      const rightVal = this.#isInBounds(rightPos) ? this.#at(rightPos) : null;

      let minPos = leftPos;
      if (rightVal !== null && this.#compareFn(leftVal, rightVal) > 0) {
        minPos = rightPos;
      }

      if (this.#compareFn(this.#at(position), this.#at(minPos)) >= 0) {
        this.#swap(position, minPos);
      } else {
        break;
      }

      position = minPos;
    }

    return position;
  }

  push(value) {
    this.#heapArr.push(value);
    this.#swimValueAt(this.size - 1);
  }

  peek() {
    if (this.size === 0) return undefined;
    return this.#at(0);
  }

  pop() {
    if (this.size === 0) return undefined;

    const result = this.peek();
    if (this.size === 1) {
      this.#heapArr.pop();
      return result;
    }

    this.#heapArr[0] = this.#heapArr.pop();
    this.#sinkValueAt(0);
    return result;
  }

  #heapifyFrom(index) {
    if (!this.#isInBounds(index) || this.#isLeaf(index)) return;

    this.#heapifyFrom(Heap.#leftChild(index));
    this.#heapifyFrom(Heap.#rightChild(index));
    this.#sinkValueAt(index);
  }

  heapify() {
    this.#heapifyFrom(0);
  }

  find(predicate) {
    return this.#heapArr.find((value) => predicate(value));
  }

  findAll(predicate) {
    return this.#heapArr.filter((value) => predicate(value));
  }

  replaceValue(value, replacement) {
    if (this.size === 0) return false;
    if (this.size === 1 && this.#heapArr[0] === value) {
      this.#heapArr[0] = replacement;
      return true;
    }

    let index = this.#indexOf(value);
    if (index < 0) return false;

    this.#heapArr[index] = replacement;
    index = this.#swimValueAt(index);
    this.#sinkValueAt(index);

    return true;
  }

  updateValue(value) {
    return this.replaceValue(value, value);
  }

  get size() {
    return this.#heapArr.length;
  }

  toString() {
    return this.#heapArr.toString();
  }
}
