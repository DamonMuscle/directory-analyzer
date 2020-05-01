import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import chalk from "chalk";
import * as shell from "shelljs";
import { default as analyze } from "./analyze";

function cleanup(temp: string) {
  shell.exec(`rm "${temp}" -force -r`);
}

export default function analyzer(scanPath: string, outputPath: string) {
  if (!os.type().toLowerCase().includes("windows")) {
    console.log(chalk.red("Currently we support windows only."));
    return;
  }

  const psFile = path.resolve(__dirname, "../src", "stats.ps1");

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }

  const temp = path.resolve(__dirname, "statsResult");
  if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
  }

  try {
    const command = `powershell.exe -ExecutionPolicy Unrestricted -File ${psFile} ${scanPath} ${temp}`;

    shell.exec(command, () => {
      analyze(temp, scanPath, outputPath);
      cleanup(temp);
      console.log(chalk.green(`Analyze finished and see the result at ${outputPath}`));
    });
  } catch (error) {
    console.log(chalk.red(error));
  }
}
