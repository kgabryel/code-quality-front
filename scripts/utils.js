import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { selectOverrideFile } from './prompts.js';

export const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const projectRoot = process.env.INIT_CWD ?? process.cwd();

export async function copy(src, dest, targetPath) {
  const destPath = resolve(targetPath, dest);
  const exists = existsSync(destPath);
  const action = existsSync(destPath) ? 'Overwritten' : 'Generated';

  if (exists) {
    const override = await selectOverrideFile(dest);

    if (!override) {
      console.log(`  Skipped ${dest}`);

      return;
    }
  }

  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(resolve(__dirname, src), destPath);
  console.log(`  ${action} ${dest}`);
}

export function detectFramework() {
  const pkgPath = resolve(projectRoot, 'package.json');

  if (!existsSync(pkgPath)) {
    return null;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if ('vue' in deps) {
    return 'vue';
  }
  if ('@angular/core' in deps) {
    return 'angular';
  }

  return null;
}

export function getResourcePath(file, framework = null) {
  let path = '../resources';

  if (framework) {
    path += `/${framework}`;
  }

  return `${path}/${file}`;
}

export function run(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { cwd: projectRoot, stdio: 'inherit' });
}
