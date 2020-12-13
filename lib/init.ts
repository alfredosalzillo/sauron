import { clone } from './clone.ts';
import { inputs, Options } from './input.ts';
import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";
import { expandGlob } from "https://deno.land/std@0.80.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.80.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import * as Base64 from "https://deno.land/std@0.74.0/encoding/base64.ts";

export type Config = {
  inputs: Options,
  exclude?: string[],
};

const readSauronConfig = (file: string) => Deno.readTextFile(file).then(YAML.parse) as Promise<Config>;
const createReplaceParameters = (parameters: Record<string, string | undefined | boolean>) => (text: string) => {
  return Object.entries(parameters).reduce((result, [name, value]) => {
    if (!value) return result;
    return result.replaceAll(`{{${name}}}`, String(value));
  }, text);
}
const files = (templateDir: string, exclude: string[] = []) => expandGlob(
  `${templateDir}/**/*`, {
    exclude: [
      `${templateDir}/.git`,
      `${templateDir}/sauron.yaml`,
      ...exclude,
    ],
  });

type CopyFilesOptions = {
  parameters: Record<string, string | undefined | boolean>,
  exclude?: string[],
};
const copyFiles = async (
  templateDir: string,
  destination: string,
  options: CopyFilesOptions,
) => {
  const {
    parameters,
    exclude = [],
  } = options;
  const replaceParameters = createReplaceParameters(parameters);
  for await (const file of files(templateDir, exclude)) {
    const path = `${destination}/${relative(templateDir, file.path)}`;
    if (file.isDirectory) {
      console.log(`creating dir ${path}`)
      await Deno.mkdir(replaceParameters(path));
    }
    if (file.isFile) {
      console.log(`creating file ${path}`);
      const text = await Deno.readTextFile(file.path);
      await Deno.writeTextFile(replaceParameters(path), replaceParameters(text));
    }
  }
}

export const init = async (template: string, destination: string, reload: boolean = false) => {
  if (!template) {
    console.error('template cannot be null');
    return;
  }
  if (!destination) {
    console.error('destination cannot be null');
    return;
  }
  const destinationExists = await fs.exists(destination);
  if (destinationExists) {
    console.error(`${destination} is not empty`);
    return;
  }
  await Deno.mkdir(destination);
  const templateDir = `~/.cache/.sauron/${Base64.encode(template)}`;
  if (reload && await fs.exists(templateDir)) {
    await Deno.remove(templateDir, { recursive: true });
  }
  await clone(template, templateDir);
  const config = await readSauronConfig(`${templateDir}/sauron.yaml`);
  const parameters = await inputs(config.inputs);
  await copyFiles(templateDir, destination, {
    parameters,
    exclude: config.exclude,
  });
  console.log('init completed');
}
