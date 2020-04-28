import * as path from "path";
import chalk from "chalk";
import { exec } from "child_process";
import { default as analyze } from "./analyze";

const psFile = path.resolve(process.cwd(), "src", "stats.ps1");

console.log(
  chalk.blue("******************* Begin Analyze **********************")
);

exec(
  `powershell.exe -ExecutionPolicy Unrestricted -File "${psFile}" "${process.cwd()}"`,
  () => {
    analyze(path.resolve(process.cwd(), "statsResult"));
    console.log(
      chalk.green("******************* End Analyze **********************")
    );
  }
);
