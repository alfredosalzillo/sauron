import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.62.0/path/mod.ts";

export async function clone(source: string, dest: string) {
  const isCloned = await fs.exists(path.join(dest, ".git"));

  if (isCloned) {
    console.log(`Repository '${source}' already exist.`);
    return;
  }

  console.log(`Clone '${source}' into '${dest}'...`);

  const clone = Deno.run({
    cmd: ["git", "clone", source, dest],
  });
  const cloneResult = await clone.status();

  if (!cloneResult.success) {
    throw new Error("Failed to clone.");
  }
}
