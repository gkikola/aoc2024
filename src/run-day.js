#! /usr/bin/env node

import path from 'path';
import fs from 'node:fs/promises';

async function run(day) {
  const dayString = `day${day < 10 ? '0' : ''}${day}`;
  const { dirname } = import.meta;
  const srcFile = path.resolve(dirname, `${dayString}/index.js`);
  const inputFile = path.resolve(dirname, `${dayString}/input.txt`);

  const module = await import(srcFile).catch(() => {
    throw new Error(`Could not import module '${srcFile}'.`);
  });
  const input = await fs.readFile(inputFile, 'utf8').catch(() => {
    throw new Error(`Could not open input file '${inputFile}'.`);
  });

  return module.default(input);
}

async function main(argv) {
  try {
    if (argv.length < 3) {
      throw new Error('Expected argument specifying advent day to run.');
    } else if (argv.length > 3) {
      throw new Error('Received too many arguments.');
    }

    const day = Number.parseInt(argv[2], 10);
    if (Number.isNaN(day)) throw new Error('Expected numeric argument.');

    console.log(await run(day));
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
    return 1;
  }

  return 0;
}

main(process.argv).then((result) => {
  process.exitCode = result;
});
