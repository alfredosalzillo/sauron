import { readLines } from "https://deno.land/std@0.76.0/io/bufio.ts";

type InputType = 'question' | 'choose' | 'confirm';
type InputConfig<Type extends InputType, Options> = {
  name: string,
  type: Type,
  message: string,
} & Options;
type QuestionConfig = InputConfig<'question', {}>;
type ChooseConfig = InputConfig<'choose', {
  values: string[],
}>;
type ConfirmConfig = InputConfig<'confirm', {}>;
type AskConfig = QuestionConfig | ChooseConfig | ConfirmConfig;
export type Options = Array<AskConfig>;

const response = async (): Promise<string> => {
  return readLines(Deno.stdin).next().then(({ value }) => value);
}
const question = async (message: string) => {
  console.log(message);
  return response();
}

const choose = async (message: string, values: string[]) => {
  console.log(message);
  console.log();
  values.forEach((value, i) => console.log(`  ${i} - ${value}`))
  console.log();
  while (true) {
    const rawResponse = await response();
    const index = Number(rawResponse);
    const value = values[index];
    if (value) {
      return value;
    }
    console.log(`invalid response: ${rawResponse}`);
  }
}

const confirm = async (message: string): Promise<boolean> => {
  console.log(`${message} (yes|NO)`);
  while (true) {
    const rawResponse = await response();
    if (/y|Y|yes|YES/ig.test(rawResponse)) {
      return true;
    }
    if (/n|N|no|NO/ig.test(rawResponse)) {
      return false;
    }
    console.log(`invalid response: ${rawResponse}`);
  }
}

const ask = async (config: AskConfig) => {
  switch (config.type) {
    case 'question':
      return question(config.message);
    case 'choose':
      return  choose(config.message, config.values);
    case 'confirm':
      return  confirm(config.message);
  }
}

export const inputs = async (config: Options) => {
  const responses: Record<string, string | undefined | boolean> = {};
  for (const c of config) {
    responses[c.name] = await ask(c);
  }
  return responses;
}
