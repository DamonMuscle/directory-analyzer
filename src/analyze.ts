import * as path from "path";
import * as os from "os";
import fsx from "fs-extra";
import { FileDetail } from "./typing";

class MyArray<T> extends Array<T> {
  constructor(items?: Array<T>) {
    if (!items) {
      super();
    } else {
      super(...items);
    }
    Object.setPrototypeOf(this, Object.create(MyArray.prototype));
  }

  last(): T | string {
    return this.length === 0 ? "" : this[this.length - 1];
  }
}

export default function (statsFolder: string, scanPath: string): FileDetail[] {
  const statsFileName = new MyArray<string>(fsx.readdirSync(statsFolder)).sort().last();

  const statsFullPath = path.resolve(statsFolder, statsFileName);

  const result = fsx
    .readFileSync(statsFullPath, { encoding: "ucs2" })
    .split(os.EOL)
    .reduce(
      (acc, l) => {
        const line = l.trim();
        if (line.includes("Mode") && line.includes("LastWriteTime") && line.includes("Length")) {
          return acc;
        }

        if (line.includes(scanPath)) {
          const index = line.indexOf(scanPath);
          acc.latestpath = line.substring(index).trim();
          return acc;
        }

        const candidate = line.split(" ").filter(Boolean);
        if (candidate.length === 5) {
          const fullPath = path.resolve(acc.latestpath, candidate[4]);
          acc.files.push({
            name: fullPath,
            length: Number(candidate[3]),
            lastWriteTime: new Date(`${candidate[1]} ${candidate[2]}`),
          });
        }

        return acc;
      },
      { latestpath: "", files: [] as FileDetail[] }
    );

  return result.files;
}
