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

type File = {
  name: string;
  lastWriteTime: Date;
  length: number;
};

export default function (statsFolder: string, scanPath: string, outputPath: string) {
  const statsFileName = new MyArray<string>(fs.readdirSync(statsFolder)).sort().last();

  const statsFullPath = path.resolve(statsFolder, statsFileName);

  const result = fs
    .readFileSync(statsFullPath, { encoding: "ucs2" })
    .split(os.EOL)
    .reduce(
      (acc, l) => {
        const line = l.trim();
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
    .map((file) => `${file.name}      ${file.lastWriteTime.toISOString()}      ${file.length}`)
    .join(os.EOL);

  const totalSize = result.files.reduce((acc, file) => acc + file.length, 0) / (1024 * 1024);

  fs.writeFileSync(
    path.resolve(outputPath, `${new Date().toISOString().replace(/[^\d|^T]/g, "")}.txt`),
    `scan path: "${scanPath}"${os.EOL}${totalSize.toFixed(2)}MB${os.EOL}${data}`
  );
}
