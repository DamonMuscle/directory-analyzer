import * as path from "path";
import * as fs from "fs";
import * as os from "os";

class MyArray<T> extends Array<T> {
  constructor(items?: Array<T>) {
    if (!items) {
      super();
    } else {
      super(...items);
    }
    Object.setPrototypeOf(this, Object.create(MyArray.prototype));
  }

  last() {
    return this.length === 0 ? "" : this[this.length - 1];
  }
}

function formatDate(date: Date) {
  let month: string | number = date.getMonth();
  month = month > 9 ? month : `0${month}`;

  return `${date.getFullYear()}${month}${date.getDate()}-${date.getHours()}:${date.getMinutes()}`;
}

type File = {
  name: string;
  lastWriteTime: Date;
  length: number;
};

export default function (statsFolder: string) {
  const statsFileName = new MyArray<string>(fs.readdirSync(statsFolder)).sort().last();

  const statsFullPath = path.resolve(statsFolder, statsFileName);

  const result = fs
    .readFileSync(statsFullPath, { encoding: "ucs2" })
    .split(os.EOL)
    .reduce(
      (acc, line) => {
        line = line.trim();
        if (line.includes("Mode") && line.includes("LastWriteTime") && line.includes("Length")) {
          return acc;
        }

        if (line.startsWith("目录")) {
          acc.latestpath = line.substring(4);
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
      { latestpath: "", files: [] as File[] }
    );

  const data = result.files
    .map((fileInfo) => `${fileInfo.name}      ${formatDate(fileInfo.lastWriteTime)}      ${fileInfo.length}`)
    .join(os.EOL);

  fs.writeFileSync(path.resolve(statsFolder, `${Date.now()}finallyResult.txt`), data);
}
