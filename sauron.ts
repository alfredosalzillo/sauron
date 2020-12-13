#!/bin/env/sh deno install --unstable --allow-read --allow-write --allow-run -n sauron sauron.ts
import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import { init } from './lib/init.ts';

const helpText = `Usage sauron init DESTINATION --template TEMPLATE [OPTIONS]...
Init DESTINATION using the TEMPLATE.
Example sauron init hello-world --template https://github.com/alfredosalzillo/example-sauron-template

Options:
  -t, --template      OPTIONS template to use (required)
  --reload            OPTIONS reload the template if cached
  --inputs.*          OPTIONS inputs to use within the template (Example --inputs.projectName hello-world)
  -h, --help          OPTIONS show help

Reports bugs to https://github.com/alfredosalzillo/sauron/issues
`

const firstNotEmpty = (names: string[], object: Record<string, string>): string | undefined => {
  return Object.entries(object).filter(([name]) => names.includes(name)).map(([,value]) => value).find((value) => value !== undefined);
}
const createParseArgs = <Args>(config: { options: Record<keyof Args, string[]> }) => (args: string[]): Args => {
  const parsed = parse(args);
  return Object.fromEntries(Object.entries<string[]>(config.options)
    .map(([name, values]) => [name, firstNotEmpty(values, parsed)])) as unknown as Args;
}
type Args = {
  template: string,
  reload: boolean,
  inputs: Record<string, string>,
  help: boolean,
};
const parseArgs = createParseArgs<Args>({
  options: {
    template: ['t', 'template'],
    reload: ['reload'],
    inputs: ['inputs'],
    help: ['h', 'help'],
  },
});
const main = async (args: string[] = Deno.args) => {
  const {
    _: [command, destination],
  } = parse(args);
  const {
    template,
    reload,
    inputs,
    help,
  } = parseArgs(args);
  if (command === 'init') {
    if (help) {
      console.log(helpText);
      return;
    }
    return init(template, destination as string, {
      reload,
      inputs,
    });
  }
  if (help) {
    console.log(helpText);
    return;
  }
}

await main();
