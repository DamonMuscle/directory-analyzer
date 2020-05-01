function handleNumber(num: number): string | number {
  return num < 10 ? `0${num}` : num;
}

export default class CustomDate extends Date {
  constructor(date: Date | undefined | string = undefined) {
    let d = date || new Date();

    if (typeof date === "string") {
      d = new Date(date);
    }

    super(d);
    Object.setPrototypeOf(this, Object.create(CustomDate.prototype));
  }

  format(): string {
    return `${this.getFullYear()}${handleNumber(this.getMonth())}${handleNumber(this.getDate())}T${handleNumber(
      this.getHours()
    )}${handleNumber(this.getMinutes())}${handleNumber(this.getSeconds())}`;
  }
}
