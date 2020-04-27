import * as path from "path";
import chalk from "chalk";
import { exec } from "child_process";

const psFile = path.resolve(process.cwd(), "src", "stats.ps1");

console.log(
  chalk.blue("******************* Begin Analyze **********************")
);

exec(
  `powershell.exe -ExecutionPolicy Unrestricted -File "${psFile}" "${process.cwd()}"`,
  () => {
    console.log(
      chalk.green("******************* End Analyze **********************")
    );
  }
);
