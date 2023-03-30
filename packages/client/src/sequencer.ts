/**
 * Generates sequence numbers.
 * TODO: Add persistence so that we don't lose the state.
 */
export default class SequenceGenerator {
  current: number;
  constructor() {
    this.current = 0;
  }

  next(): number {
    this.current = this.current + 1;
    return this.current;
  }
}
