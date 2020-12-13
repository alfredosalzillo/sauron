#!/bin/env/sh deno install --unstable --allow-read --allow-write --allow-run -n sauron sauron.ts
import { parse } from "https://deno.land/std@0.80.0/flags/mod.ts";
import { init } from './lib/init.ts';

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
