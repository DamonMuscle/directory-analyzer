import * as path from "path";
import * as os from "os";
import chalk from "chalk";
import shell from "shelljs";
import fsx from "fs-extra";
import { FileDetail, CustomDate } from "./typing";
import { default as analyze } from "./analyze";

function writeResult2File(scanPath: string, outputPath: string, files: FileDetail[]): void {
  const totalSize = files.reduce((acc, file) => acc + (file.length || 0), 0) / (1024 * 1024);

  const data = files.map((file) => `${file.name}      ${file.lastWriteTime.format()}      ${file.length}`).join(os.EOL);

  fsx.writeFileSync(outputPath, `scan path: "${scanPath}"${os.EOL}${totalSize.toFixed(2)}MB${os.EOL}${data}`);
}

function walk(dir: string): FileDetail[] {
  const files: FileDetail[] = [];
  fsx.readdirSync(dir).forEach((file) => {
    const fullpath = path.resolve(dir, file);
    try {
      const detail = fsx.statSync(fullpath);
      if (detail.isDirectory()) {
        files.push(...walk(fullpath));
      } else {
        files.push({
          name: fullpath,
          lastWriteTime: new CustomDate(detail.mtime),
          length: detail.size,
        } as FileDetail);
      }
    } catch (error) {
      console.log(error);
    }
  });

  return files;
}

function scanWindows(scanPath: string): Promise<FileDetail[]> {
  const psFile = path.resolve(__dirname, "../src", "stats.ps1");
  const temp = path.resolve(__dirname, "statsResult");
  if (!fsx.existsSync(temp)) {
    fsx.mkdirSync(temp);
  }

  let p: Promise<FileDetail[]> = Promise.resolve([]);
  try {
    const command = `powershell.exe -ExecutionPolicy Unrestricted -File ${psFile} ${scanPath} ${temp}`;

    p = new Promise((resolve) => {
      shell.exec(command, () => {
        resolve(analyze(temp, scanPath));
      });
    });
  } catch (error) {
    console.log(chalk.red(error));
  }

  return p.then((v) => {
    fsx.removeSync(temp);
    return v;
  });
}

function scanNoneWindows(scanPath: string): Promise<FileDetail[]> {
  return Promise.resolve(walk(scanPath));
}

export function scan(scanPath: string): Promise<FileDetail[]> {
  return os.type().toLowerCase().includes("windows") ? scanWindows(scanPath) : scanNoneWindows(scanPath);
}

export default function analyzer(scanPath: string, outputDir: string): void {
  if (!fsx.existsSync(scanPath)) {
    console.log(chalk.red(`"${scanPath}" is not exist.`));
    return;
  }

  if (!fsx.existsSync(outputDir)) {
    try {
      fsx.mkdirSync(outputDir);
    } catch {
      console.log(chalk.red(`"${outputDir}" is not exist and cannot be created.`));
      return;
    }
  }

  scan(scanPath).then((files) => {
    const outputPath = path.resolve(outputDir, `${new CustomDate().format()}.txt`);
    writeResult2File(scanPath, outputPath, files);
    console.log(chalk.green(`Analyze finished and see the result at ${outputPath}`));
  });
}
