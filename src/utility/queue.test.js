import Queue from './queue.js';

describe('Queue', () => {
  const queue = new Queue();

  test('Empty queue', () => {
    expect(queue.size).toBe(0);
    expect(queue.peek()).toBe(null);
  });

  test('Queue insertion', () => {
    queue.enqueue(3);
    expect(queue.peek()).toBe(3);
    queue.enqueue(4);
    expect(queue.peek()).toBe(3);
    queue.enqueue(10);
    expect(queue.peek()).toBe(3);

    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBe(4);
    expect(queue.dequeue()).toBe(10);
    expect(queue.dequeue()).toBe(null);
  });
});
