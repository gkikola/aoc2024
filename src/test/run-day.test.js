import path from 'path';
import fs from 'node:fs/promises';

import module from './module.cjs';

const baseDir = path.resolve(module.dirname, '..');

async function processDirectory(directory) {
  const srcFile = path.resolve(baseDir, directory, 'index.js');
  const inputFile = path.resolve(baseDir, directory, 'example-input.txt');
  const outputFile = path.resolve(baseDir, directory, 'example-output.txt');

  const dayModule = await import(srcFile).catch(() => {
    throw new Error(`Could not import module '${srcFile}'.`);
  });
  const input = await fs.readFile(inputFile, 'utf8').catch(() => {
    throw new Error(`Could not open input file '${inputFile}'.`);
  });
  const output = await fs.readFile(outputFile, 'utf8').catch(() => {
    throw new Error(`Could not open output file '${outputFile}'.`);
  });

  test(`${directory}/index.js produces correct output`, () => {
    expect(dayModule.default(input)).toBe(output);
  });
}

const dirContents = await fs.readdir(baseDir, {
  withFileTypes: true,
});
const testPromises = dirContents
  .filter((dir) => dir.isDirectory() && dir.name.startsWith('day'))
  .map((dir) => dir.name)
  .map((dir) => processDirectory(dir));

await Promise.all(testPromises);
