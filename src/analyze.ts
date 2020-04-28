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

type Directory = {
  directory?: string;
};

type File = {
  name: string;
  lastWriteTime: Date;
  length: number;
};

export default function (statsFolder: string) {
  const statsFileName = new MyArray<string>(fs.readdirSync(statsFolder))
    .sort()
    .last();
  const statsFullPath = path.resolve(statsFolder, statsFileName);

  const arr = fs
    .readFileSync(statsFullPath, { encoding: "ucs2" })
    .split(os.EOL)
    .map((line): File | Directory | string => {
      line = line.trim();
      if (
        line.includes("Mode") &&
        line.includes("LastWriteTime") &&
        line.includes("Length")
      ) {
        line = "";
      }

      if (line.startsWith("目录")) {
        return {
          directory: line.substring(4),
        };
      }
      const candidate = line.split(" ").filter(Boolean);
      if (candidate.length === 5) {
        return {
          name: candidate[4],
          length: Number(candidate[3]),
          lastWriteTime: new Date(`${candidate[1]} ${candidate[2]}`),
        };
      }

      return "";
    })
    .filter(Boolean);

  if (!(arr[0] as { directory?: string }).directory) {
    throw new Error("exception");
  }

  const result = arr.reduce(
    (acc, current: Directory | File | string) => {
      if (typeof current === "string") {
        return acc;
      }

      const { directory } = current as Directory;
      if (directory) {
        acc.latestpath = directory;

        return acc;
      }

      try {
        const fullPath = path.resolve(acc.latestpath, (current as File).name);
        acc.files.push({ ...current, name: fullPath } as File);
      } catch (error) {
        console.log(error);
      }
      return acc;
    },
    { latestpath: "", files: new MyArray<File>() }
  );

  console.log(result);
}
