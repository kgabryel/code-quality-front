import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { selectOverrideFile } from './prompts.js';

export async function createDockerScripts(framework, targetPath, containerName, features) {
  for (const feature of features) {
    if (!scripts(framework)[feature]) continue;

    for (const script of scripts(framework)[feature]) {
      await writeToFile(script.name, targetPath, `docker exec -it ${containerName} sh -c '${script.content}'`);
    }
  }
}

export async function createLocalScripts(framework, targetPath, features) {
  for (const feature of features) {
    if (!scripts(framework)[feature]) continue;

    for (const script of scripts(framework)[feature]) {
      await writeToFile(script.name, targetPath, script.content);
    }
  }
}

const scripts = (framework) => ({
  eslint: [
    { content: 'npx eslint src', name: 'lint.sh' },
    { content: 'npx eslint src --fix', name: 'lint-fix.sh' },
  ],
  prettier: [{ content: 'npx prettier --write .', name: 'prettier.sh' }],
  stylelint: [
    { content: 'npx stylelint "src/**/*.vue" "src/**/*.scss"', name: 'stylelint.sh' },
    { content: 'npx stylelint "src/**/*.vue" "src/**/*.scss" --fix', name: 'stylelint-fix.sh' },
  ],
  tsconfig: [
    {
      content: framework === 'vue' ? 'npx vue-tsc --noEmit' : 'npx tsc --noEmit',
      name: 'typecheck.sh',
    },
  ],
});

async function writeToFile(dest, targetPath, content) {
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

  writeFileSync(destPath, content, 'utf8');
  console.log(`  ${action} ${dest}`);
}
