import * as path from "path";
import * as os from "os";
import chalk from "chalk";
import moment from "moment";
import * as shell from "shelljs";
import fsx from "fs-extra";
import { default as analyze } from "./analyze";
import { FileDetail } from "./typing";

function writeResult2File(scanPath: string, outputPath: string, files: FileDetail[]): void {
  const totalSize = files.reduce((acc, file) => acc + (file.length || 0), 0) / (1024 * 1024);

  const data = files
    .map((file) => `${file.name}      ${moment(file.lastWriteTime).format("YYYYMMDD-HH:mm:ss")}      ${file.length}`)
    .join(os.EOL);

  fsx.writeFileSync(outputPath, `scan path: "${scanPath}"${os.EOL}${totalSize.toFixed(2)}MB${os.EOL}${data}`);
}

export function scan(scanPath: string): Promise<FileDetail[]> {
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

export default function analyzer(scanPath: string, outputDir: string): void {
  if (!os.type().toLowerCase().includes("windows")) {
    console.log(chalk.red("Currently we support windows only."));
    return;
  }

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
    const outputPath = path.resolve(outputDir, `${moment().format("YYYYMMDDTHHmmss")}.txt`);
    writeResult2File(scanPath, outputPath, files);
    console.log(chalk.green(`Analyze finished and see the result at ${outputPath}`));
  });
}
