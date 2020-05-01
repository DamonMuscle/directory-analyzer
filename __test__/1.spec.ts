import fsx from "fs-extra";
import * as path from "path";
import { scan } from "../src/index";

function generateText(): string {
  return new Array(100)
    .fill("")
    .map(() => `${Math.random().toString(36).substring(2)}_${Date.now()}.txt`)
    .join(" ");
}

test("smoke", async () => {
  const tempDir = path.resolve(__dirname, Math.random().toString(36).substring(2));
  fsx.mkdirSync(tempDir);

  const count = Math.max(Math.floor(Math.random() * 1000), 800);
  const fileNames = new Array(count).fill("").map(() => {
    const fullpath = path.resolve(tempDir, `${Math.random().toString(36).substring(2)}_${Date.now()}.txt`);

    fsx.writeFileSync(fullpath, generateText());
    return fullpath;
  });

  const scanResult = await scan(tempDir);

  expect(scanResult.map((x) => x.name).every((x) => fileNames.includes(x)) && scanResult.length > 0).toBe(true);

  fsx.remove(tempDir);
});
