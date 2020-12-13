import { clone } from './clone.ts';
import * as Base64 from "https://deno.land/std@0.74.0/encoding/base64.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import { join, isAbsolute } from "https://deno.land/std@0.80.0/path/mod.ts";
import isURL from './validator/isURL.ts';
import isFile from './validator/isFile.ts';

const getTemplateDir = (template: string) => {
  if (isURL(template)) {
    return `~/.cache/.sauron/${Base64.encode(template)}`;
  }
  if (isFile(template)) {
    return `~/.cache/.sauron/${Base64.encode(isAbsolute(template) ? template : join(Deno.cwd(), template))}`;
  }
  throw new TypeError('template not supported');
}

const copy = async (source: string, dest: string) => {
  const exists = await fs.exists(join(dest, ".sauron"));
  if (exists) {
    console.log(`Template '${source}' already exist.`);
    return;
  }
  await fs.copy(source, dest);
  await fs.writeJson(join(dest, ".sauron"), {});
}

const copyTemplate = (template: string, cacheDir: string) => {
  if (isURL(template)) {
    return clone(template, cacheDir);
  }
  if (isFile(template)) {
    return copy(template, cacheDir);
  }
  throw new TypeError('template not supported');
}

type RegisterOptions = {
  reload?: boolean,
}
export const register = async (template: string, options: RegisterOptions) => {
  const { reload } = options;
  const cacheDir = getTemplateDir(template);
  if (reload && await fs.exists(cacheDir)) {
    console.log(`clean cache ${cacheDir}`)
    await Deno.remove(cacheDir, { recursive: true });
  }
  await copyTemplate(template, cacheDir);
  return cacheDir;
}
