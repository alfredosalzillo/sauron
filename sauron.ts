#!/bin/env/sh deno install --unstable --allow-read --allow-write --allow-run -n sauron sauron.ts
import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import { init } from './lib/init.ts';

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
      console.log('usage:')
      console.log(' sauron init [destination] --template [template-url]')
      return;
    }
    return init(template!, destination as string, {
      reload: !!reload,
      inputs,
    });
  }
  if (help) {
    console.log('usage:')
    console.log(' sauron init [destination] --template [template-url]')
    return;
  }
}

await main();
