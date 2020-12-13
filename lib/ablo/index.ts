import { readLines } from "https://deno.land/std@0.76.0/io/bufio.ts";

const write = (message: string) => Deno.stdout.write(new TextEncoder().encode(message));
const read = async (defaultValue?: string): Promise<string> => {
  return readLines(Deno.stdin).next().then(({ value }) => value || defaultValue);
}

export const question = async (message: string, defaultValue?: string) => {
  await write(`${message} ${defaultValue ? `(default ${defaultValue}) ` : ''}`);
  while (true) {
    const rawResponse = await read(defaultValue);
    if (rawResponse) {
      return rawResponse;
    }
    console.log(`invalid response: ${rawResponse}`);
  }
}

export const choose = async (message: string, values: string[], defaultValue?: string) => {
  console.log(`${message}${defaultValue ? ` (default ${defaultValue})` : ''}`);
  console.log();
  values.forEach((value, i) => console.log(`  ${i} - ${value}`))
  console.log();
  while (true) {
    const rawResponse = await read(defaultValue);
    const index = Number(rawResponse);
    const value = values[index];
    if (value) {
      return value;
    }
    console.log(`invalid response: ${rawResponse}`);
  }
}

export const confirm = async (message: string, defaultValue?: string): Promise<boolean> => {
  await write(`${message} [yes|NO]${defaultValue ? ` (default ${defaultValue})` : ''}`);
  while (true) {
    const rawResponse = await read(defaultValue);
    if (/y|Y|yes|YES/ig.test(rawResponse)) {
      return true;
    }
    if (/n|N|no|NO/ig.test(rawResponse)) {
      return false;
    }
    console.log(`invalid response: ${rawResponse}`);
  }
}

export type InputType = 'question' | 'choose' | 'confirm';
export type InputOptions<Type extends InputType, Options = {}> = {
  name: string,
  type: Type,
  message: string,
  default?: string,
} & Options;
export type QuestionOptions = InputOptions<'question'>;
export type ChooseOptions = InputOptions<'choose', {
  values: string[],
}>;
export type ConfirmOptions = InputOptions<'confirm'>;
export type AskOptions = QuestionOptions | ChooseOptions | ConfirmOptions;
export type AskAllOptions = Array<AskOptions>;
export const ask = async (config: AskOptions) => {
  switch (config.type) {
    case 'question':
      return question(config.message, config.default);
    case 'choose':
      return  choose(config.message, config.values, config.default);
    case 'confirm':
      return  confirm(config.message, config.default);
  }
}

export const askAll = async (options: AskAllOptions) => {
  const responses: Record<string, string | undefined | boolean> = {};
  for (const input of options) {
    responses[input.name] = await ask(input);
  }
  return responses;
}
