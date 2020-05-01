import * as path from "path";
import * as os from "os";
import fsx from "fs-extra";
import { FileDetail, CustomArray, CustomDate } from "./typing";

export default function (statsFolder: string, scanPath: string): FileDetail[] {
  const statsFileName = new CustomArray<string>(fsx.readdirSync(statsFolder)).sort().last();

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
            lastWriteTime: new CustomDate(`${candidate[1]} ${candidate[2]}`),
          });
        }

        return acc;
      },
      { latestpath: "", files: [] as FileDetail[] }
    );

  return result.files;
}
