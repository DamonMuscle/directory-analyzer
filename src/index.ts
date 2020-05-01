import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import chalk from "chalk";
import * as shell from "shelljs";
import { default as analyze } from "./analyze";

function cleanup(temp: string) {
  shell.exec(`rm "${temp}" -force -r`);
}

export default function analyzer(scanPath: string, outputDir: string) {
  if (!os.type().toLowerCase().includes("windows")) {
    console.log(chalk.red("Currently we support windows only."));
    return;
  }

  if (!fs.existsSync(scanPath)) {
    console.log(chalk.red(`"${scanPath}" is not exist.`));
    return;
  }

  const psFile = path.resolve(__dirname, "../src", "stats.ps1");

  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir);
    } catch {
      console.log(chalk.red(`"${outputDir}" is not exist and cannot be created.`));
      return;
    }
  }

  const temp = path.resolve(__dirname, "statsResult");
  if (!fs.existsSync(temp)) {
    fs.mkdirSync(temp);
  }

  try {
    const command = `powershell.exe -ExecutionPolicy Unrestricted -File ${psFile} ${scanPath} ${temp}`;

    shell.exec(command, () => {
      const outputPath = analyze(temp, scanPath, outputDir);
      cleanup(temp);
      console.log(chalk.green(`Analyze finished and see the result at ${outputPath}`));
    });
  } catch (error) {
    console.log(chalk.red(error));
  }
}
