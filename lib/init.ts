import { inputs } from './input.ts';
import { expandGlob } from "https://deno.land/std@0.80.0/fs/mod.ts";
import { relative } from "https://deno.land/std@0.80.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.62.0/fs/mod.ts";
import { basename } from "https://deno.land/std@0.80.0/path/mod.ts";
import { readConfig } from './config.ts';
import { register } from './register.ts';

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

const createReplaceParameters = (parameters: Record<string, string | undefined | boolean>) => (text: string) => {
  return text.replaceAll(/{{([^}]*)}}/ig, (match, name) => {
    if (name in parameters) {
      return String(parameters[name]);
    }
    return match;
  })
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
  transform: (string: string) => string,
  exclude?: string[],
};
const copyFiles = async (
  templateDir: string,
  destination: string,
  options: CopyFilesOptions,
) => {
  const {
    transform,
    exclude = [],
  } = options;
  for await (const file of files(templateDir, exclude)) {
    const path = transform(`${destination}/${relative(templateDir, file.path)}`);
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
  await Deno.mkdir(destination);
  const templateDir = await register(template, { reload });
  const config = await readConfig(options.config || `${templateDir}/sauron.yaml`);
  if (config.name) {
    console.log(`using template ${[config.name, config.version].join(' ')}`);
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
  const replaceParameters = createReplaceParameters(parameters);
  await copyFiles(templateDir, destination, {
    transform: replaceParameters,
    exclude: config.exclude,
  });
  if (config.after) {
    console.log(replaceParameters(config.after));
    return;
  }
  console.log('init completed');
}
