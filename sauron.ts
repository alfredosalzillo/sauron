#!/bin/env/sh deno install --unstable --allow-read --allow-write --allow-run -n sauron sauron.ts
import { inputs, Options } from './lib/input.ts';
import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";
import { expandGlob } from "https://deno.land/std@0.80.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.80.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import * as Base64 from "https://deno.land/std@0.74.0/encoding/base64.ts";

import { clone } from './lib/clone.ts';

type Config = {
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

const init = async (template: string, destination: string, reload: boolean = false) => {
    console.assert(!!template, 'template cannot be null');
    console.assert(!!destination, 'destination cannot be null');
    const destinationExists = await fs.exists(destination);
    if (destinationExists) {
        console.log(`${destination} is not empty`);
        return;
    }
    await Deno.mkdir(destination);
    const templateDir = `~/.cache/.sauron/${Base64.encode(template)}`;
    if (reload && await fs.exists(templateDir)) {
      await Deno.remove(templateDir, { recursive: true });
    }
    await clone(template, templateDir);
    const config = await readSauronConfig(`${templateDir}/sauron.yaml`);
    const parameters  = await inputs(config.inputs);
    const replaceParameters = createReplaceParameters(parameters);
    const { exclude = [] } = config;
    for await (const file of expandGlob(
      `${templateDir}/**/*`, {
          exclude: [`${templateDir}/.git`, ...exclude],
      })) {
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
    console.log('init completed');
}
const firstNotEmpty = (names: string[], object: Record<string, string>): string | undefined => {
  return Object.entries(object).filter(([name]) => names.includes(name)).map(([,value]) => value).find((value) => value !== undefined);
}
const createParseArgs = <Keys extends string>(config: { options: Record<Keys, string[]> }) => (args: string[]): Record<Keys, string | undefined> => {
  const parsed = parse(args);
  return Object.fromEntries(Object.entries<string[]>(config.options).map(([name, values]) => [name, firstNotEmpty(values, parsed)])) as Record<Keys, string | undefined>;
}
const parseArgs = createParseArgs({
  options: {
    template: ['t', 'template'],
    reload: ['reload'],
    help: ['h', 'help'],
  },
});
const main = async (args: string[] = Deno.args) => {
  const {
    _: [command, destination],
  } = parse(args);
  const { template, reload, help } = parseArgs(args);
  if (command === 'init') {
    if (help) {
      console.log('usage:')
      console.log(' sauron init [destination] --template [template-url]')
      return;
    }
    return init(template!, destination as string, !!reload);
  }
  if (help) {
    console.log('usage:')
    console.log(' sauron init [destination] --template [template-url]')
    return;
  }
}

await main();
