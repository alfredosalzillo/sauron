import * as YAML from "https://deno.land/std@0.80.0/encoding/yaml.ts";
import { InputsOptions } from './input.ts';

export type Config = {
  inputs: InputsOptions,
  exclude?: string[],
};

export const readConfig = (file: string) => Deno.readTextFile(file).then(YAML.parse) as Promise<Config>;
