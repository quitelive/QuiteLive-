/*
 Queue class
 This code is taken from https://www.geeksforgeeks.org/implementation-queue-javascript/
 
 */

class queue {
  constructor() {
    this.items = [];
  }

  // enqueue function
  enqueue(element) {
    // adding element to the queue
    this.items.push(element);
  }

  // dequeue function
  dequeue() {
    // removing element from the queue returns underflow when called on empty queue
    if (this.isEmpty()) return "Underflow";
    return this.items.shift();
  }

  // front function
  front() {
    // returns the Front element of the queue without removing it.
    if (this.isEmpty()) return "No elements in Queue";
    return this.items[0];
  }

  // isEmpty function
  isEmpty() {
    // return true if the queue is empty.
    return this.items.length === 0;
  }

  // printQueue function
  printQueue() {
    let str = "";
    for (let i = 0; i < this.items.length; i++) {
      str += this.items[i] + " ";
    }
    return str;
  }
}

module.exports = queue;