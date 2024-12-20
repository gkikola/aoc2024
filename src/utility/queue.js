class Node {
  value;
  previous;

  constructor(value, previous = null) {
    this.value = value;
    this.previous = previous;
  }
}

export default class Queue {
  #head;
  #tail;
  #size;

  constructor(fromArray = []) {
    this.#head = null;
    this.#tail = null;
    this.#size = 0;

    fromArray.forEach((element) => this.enqueue(element));
  }

  enqueue(element) {
    if (this.#tail === null) {
      // Queue is empty
      this.#head = new Node(element);
      this.#tail = this.#head;
    } else {
      const oldTail = this.#tail;
      this.#tail = new Node(element);
      oldTail.previous = this.#tail;
    }

    this.#size++;
  }

  dequeue() {
    if (this.#head === null) return null;

    const oldHead = this.#head;
    this.#head = this.#head.previous;
    this.#size--;

    // Reset tail if the last element was removed
    if (this.#head === null) this.#tail = null;

    return oldHead.value;
  }

  peek() {
    if (this.#head === null) return null;
    return this.#head.value;
  }

  get size() {
    return this.#size;
  }
}
