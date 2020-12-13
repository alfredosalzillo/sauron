import * as YAML from 'https://deno.land/std@0.80.0/encoding/yaml.ts';
import * as fs from 'https://deno.land/std@0.62.0/fs/mod.ts';
import { AskAllOptions } from './ablo/input.ts';
import isURL from './validator/isURL.ts';
import isFile from './validator/isFile.ts';

export type Config = {
  name?: string,
  version?: string,
  inputs: AskAllOptions,
  exclude?: string[],
  after?: string,
  before?: string,
};

export const readConfigByUrl = (url: string) => fetch(url)
  .then(async (response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error(await response.text());
  })
  .then(YAML.parse) as Promise<Config>;

export const readConfig = async (config: string): Promise<Config> => {
  if (isURL(config)) {
    console.log(`using remote config ${config}`);
    return readConfigByUrl(config);
  }
  if (isFile(config)) {
    if (!fs.exists(config)) {
      console.log(`config file ${config} not found inside the template, using default.`)
      return {
        inputs: [],
      };
    }
    return Deno.readTextFile(config).then(YAML.parse) as Promise<Config>;
  }
  try {
    return JSON.parse(config);
  } catch (e) {
    console.error(e);
  }
  throw new TypeError('invalid config type, should be an URL or a PATH');
};
