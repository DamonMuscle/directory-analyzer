import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import * as shell from "shelljs";
import { default as analyze } from "./analyze";

const config: {
  scanPath: string;
  outputPath: string;
} = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config.json"), { encoding: "utf8" }));

const psFile = path.resolve(process.cwd(), "src", "stats.ps1");

if (!fs.existsSync(config.outputPath)) {
  fs.mkdirSync(config.outputPath);
}

const temp = path.resolve(process.cwd(), "statsResult");
if (!fs.existsSync(temp)) {
  fs.mkdirSync(temp);
}

const command = `powershell.exe -ExecutionPolicy Unrestricted -File ${psFile} ${config.scanPath} ${temp}`;

console.log(chalk.blue("******************* Begin Scan **********************"));

shell.exec(command, () => {
  console.log(chalk.yellow("******************* Begin Analyze **********************"));
  analyze(temp, config.scanPath, config.outputPath);
  console.log(chalk.green("*********************** End ***************************"));
});
