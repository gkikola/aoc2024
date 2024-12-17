import Heap from './heap.js';

describe('Heap', () => {
  const heap = new Heap();

  test('Empty heap size', () => {
    expect(heap.size).toBe(0);
  });

  test('Heap insertion', () => {
    heap.push('dog');
    heap.push('cat');
    heap.push('cow');
    heap.push('aardvark');

    expect(heap.size).toBe(4);
    expect(heap.peek()).toBe('aardvark');
  });

  test('Heap removal', () => {
    expect(heap.pop()).toBe('aardvark');
    expect(heap.pop()).toBe('cat');
    expect(heap.peek()).toBe('cow');
    expect(heap.pop()).toBe('cow');
    expect(heap.peek()).toBe('dog');
    expect(heap.pop()).toBe('dog');
    expect(heap.size).toBe(0);

    expect(heap.peek()).toBe(undefined);
    expect(heap.pop()).toBe(undefined);
    expect(heap.size).toBe(0);
  });

  test('Custom heap comparison function', () => {
    const maxHeap = new Heap((a, b) => b - a);
    maxHeap.push(3);
    maxHeap.push(10);
    maxHeap.push(1);
    maxHeap.push(3);
    maxHeap.push(5);
    maxHeap.push(7);
    maxHeap.push(0);
    maxHeap.push(-100);

    expect(maxHeap.size).toBe(8);
    expect(maxHeap.pop()).toBe(10);
    expect(maxHeap.pop()).toBe(7);
    expect(maxHeap.pop()).toBe(5);
    expect(maxHeap.pop()).toBe(3);
    expect(maxHeap.pop()).toBe(3);
    expect(maxHeap.pop()).toBe(1);
    expect(maxHeap.pop()).toBe(0);
    expect(maxHeap.pop()).toBe(-100);
  });

  test('Updating heap elements', () => {
    const objHeap = new Heap((a, b) => a.value - b.value);
    const objects = [];
    for (let i = 0; i < 10; i++) {
      objects.push({ value: i });
      objHeap.push(objects[i]);
    }

    expect(objHeap.size).toBe(10);
    expect(objHeap.peek().value).toBe(0);

    objHeap.replaceValue(objects[4], { value: -1 });
    expect(objHeap.peek().value).toBe(-1);
    objHeap.pop();
    objHeap.push(objects[4]);

    for (let i = 0; i < 10; i++) {
      objects[i].value = (i + 3) % 10;
    }
    expect(objHeap.peek().value).toBe(3);
    objHeap.heapify();
    expect(objHeap.peek().value).toBe(0);
    expect(objHeap.pop().value).toBe(0);
    expect(objHeap.pop().value).toBe(1);
    expect(objHeap.pop().value).toBe(2);
    expect(objHeap.pop().value).toBe(3);
    expect(objHeap.pop().value).toBe(4);
    expect(objHeap.pop().value).toBe(5);
    expect(objHeap.pop().value).toBe(6);
    expect(objHeap.pop().value).toBe(7);
    expect(objHeap.pop().value).toBe(8);
    expect(objHeap.pop().value).toBe(9);

    for (let i = 0; i < 10; i++) {
      objects[i].value = i * 10;
      objHeap.push(objects[i]);
    }

    const newValue = [5, 25, 15, 95, 95, 18, 47, 9, 82, 99];
    expect(objHeap.peek().value).toBe(0);
    for (let i = 0; i < 10; i++) {
      objHeap.replaceValue(objects[i], { value: newValue[i] });
    }
    expect(objHeap.peek().value).toBe(5);
    expect(objHeap.pop().value).toBe(5);
    expect(objHeap.pop().value).toBe(9);
    expect(objHeap.pop().value).toBe(15);
    expect(objHeap.pop().value).toBe(18);
    expect(objHeap.pop().value).toBe(25);
    expect(objHeap.pop().value).toBe(47);
    expect(objHeap.pop().value).toBe(82);
    expect(objHeap.pop().value).toBe(95);
    expect(objHeap.pop().value).toBe(95);
    expect(objHeap.pop().value).toBe(99);

    objHeap.push({ value: 5 });
    objHeap.push({ value: 9 });
    objHeap.push({ value: 14 });
    objHeap.peek().value = 12;
    expect(objHeap.peek().value).toBe(12);
    objHeap.updateValue(objHeap.peek());
    expect(objHeap.pop().value).toBe(9);
    expect(objHeap.pop().value).toBe(12);
    expect(objHeap.pop().value).toBe(14);
  });
});
