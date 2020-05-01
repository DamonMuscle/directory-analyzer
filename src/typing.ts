import { default as CustomDate } from "./customeDate";
import { default as CustomArray } from "./customArray";

export type FileDetail = {
  name: string;
  lastWriteTime: CustomDate;
  length: number;
};

export { CustomArray, CustomDate };
