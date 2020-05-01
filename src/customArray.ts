export default class CustomArray<T> extends Array<T> {
  constructor(items?: Array<T>) {
    if (!items) {
      super();
    } else {
      super(...items);
    }
    Object.setPrototypeOf(this, Object.create(CustomArray.prototype));
  }

  last(): T | string {
    return this.length === 0 ? "" : this[this.length - 1];
  }
}
