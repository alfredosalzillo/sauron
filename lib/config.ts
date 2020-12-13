import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import { InputsOptions } from './input.ts';

export type Config = {
  inputs: InputsOptions,
  exclude?: string[],
};

export const readConfig = async (file: string): Promise<Config> => {
  if (!fs.exists(file)) {
    console.log(`config file ${file} not found inside the template, using default.`)
    return {
      inputs: [],
    };
  }
  return Deno.readTextFile(file).then(YAML.parse) as Promise<Config>;
};
