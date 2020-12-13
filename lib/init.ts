import { inputs } from './input.ts';
import { expandGlob } from "https://deno.land/std@0.80.0/fs/mod.ts";
import { relative, join } from "https://deno.land/std@0.80.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import { basename } from "https://deno.land/std@0.80.0/path/mod.ts";
import { readConfig } from './config.ts';
import { register } from './register.ts';
import * as liquid from './liquid/index.ts';

type GlobalParametersInput = {
  destination: string,
  template: string,
  templateName?: string,
  templateVersion?: string,
}
const getGlobalParameters = ({ destination, template, templateName, templateVersion }: GlobalParametersInput) => ({
  DESTINATION: destination,
  DESTINATION_BASENAME: basename(destination),
  TEMPLATE_NAME: templateName,
  TEMPLATE_VERSION: templateVersion,
  TEMPLATE: template,
})

const files = (templateDir: string, exclude: string[] = []) => expandGlob(
  `${templateDir}/**/*`, {
    exclude: [
      `${templateDir}/.git`,
      `${templateDir}/sauron.yaml`,
      ...exclude,
    ],
  });

type CopyFilesOptions = {
  transform?: (string: string) => string,
  exclude?: string[],
};
const identity = <T>(input: T) => input;
const copyFiles = async (
  source: string,
  destination: string,
  options: CopyFilesOptions,
) => {
  const {
    transform = identity,
    exclude = [],
  } = options;
  for await (const file of files(source, exclude)) {
    const path = transform(join(destination, relative(source, file.path)));
    if (file.isDirectory) {
      console.log(`creating dir ${path}`)
      await Deno.mkdir(path);
    }
    if (file.isFile) {
      console.log(`creating file ${path}`);
      const text = await Deno.readTextFile(file.path).then(transform);
      await Deno.writeTextFile(path, text);
    }
  }
}
export type InitOptions = {
  reload?: boolean,
  inputs?: Record<string, string | boolean>,
  config?: string,
}
export const init = async (
  template: string,
  destination: string,
  options: InitOptions,
) => {
  const {
    reload = false,
    inputs: providedInputs = {},
  } = options;
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
  const templateDir = await register(template, { reload });
  const config = await readConfig(options.config || `${templateDir}/sauron.yaml`);
  if (config.name) {
    console.log(`using template ${[config.name, config.version].join('@')}`);
  }
  if (config.before) {
    console.log(config.before);
  }
  const inputToAsk = config.inputs.filter(({ name }) => !(name in providedInputs));
  const parameters = await inputs(inputToAsk)
    .then((parameters) => ({
      ...parameters,
      ...providedInputs,
      ...getGlobalParameters({
        destination,
        template,
        templateName: config.name,
        templateVersion: config.version,
      })
    }));
  await Deno.mkdir(destination);
  const transform = (string: string) => liquid.parse(string, parameters);
  await copyFiles(templateDir, destination, {
    transform,
    exclude: config.exclude,
  });
  if (config.after) {
    console.log(transform(config.after));
    return;
  }
  console.log('init completed');
}
