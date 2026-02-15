import { copyFile, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const buildDir = resolve(rootDir, 'build');

const assets = ['main.js', 'manifest.json', 'styles.css'];

const ensureFileExists = async (path) => {
  await access(path, fsConstants.F_OK);
};

for (const asset of assets) {
  const source = resolve(buildDir, asset);
  const destination = resolve(rootDir, asset);
  await ensureFileExists(source);
  await copyFile(source, destination);
  console.log(`synced: ${asset}`);
}
