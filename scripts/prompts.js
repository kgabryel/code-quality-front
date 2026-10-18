import { existsSync } from 'node:fs';
import prompts from 'prompts';

import { detectFramework, projectRoot } from './utils.js';

const cancelAction = () => {
  console.log('\nCancelled.');
  process.exit(0);
};

export async function selectBasePath() {
  const { targetPath } = await prompts(
    {
      initial: projectRoot,
      message: 'Target path',
      name: 'targetPath',
      type: 'text',
      validate: (value) => (existsSync(value.trim()) ? true : 'Path does not exist'),
    },
    { onCancel: cancelAction },
  );

  return targetPath;
}

export async function selectContainerName() {
  const { name } = await prompts(
    {
      message: 'Docker container name',
      name: 'name',
      type: 'text',
      validate: (value) => (value.trim().length > 0 ? true : 'Container name is required'),
    },
    { onCancel: cancelAction },
  );

  return name;
}

export async function selectCreateScripts() {
  const { shouldCreateScripts } = await prompts(
    {
      initial: true,
      message: 'Create helper scripts',
      name: 'shouldCreateScripts',
      type: 'confirm',
    },
    { onCancel: cancelAction },
  );

  return shouldCreateScripts;
}

export async function selectFeatures() {
  const { features } = await prompts(
    {
      choices: [
        { selected: true, title: 'EditorConfig', value: 'editorconfig' },
        { selected: true, title: 'TypeScript', value: 'tsconfig' },
        { selected: true, title: 'ESLint', value: 'eslint' },
        { selected: true, title: 'Prettier', value: 'prettier' },
        { selected: true, title: 'Stylelint', value: 'stylelint' },
      ],
      message: 'Select features',
      name: 'features',
      type: 'multiselect',
    },
    { onCancel: cancelAction },
  );

  return features;
}

export async function selectFramework(args) {
  let framework = args.includes('--vue') ? 'vue' : args.includes('--angular') ? 'angular' : null;

  if (framework) {
    return framework;
  }

  const detected = detectFramework();
  const initial = detected === 'vue' ? 0 : detected === 'angular' ? 1 : 2;

  const { chosen } = await prompts(
    {
      choices: [
        { title: 'Vue', value: 'vue' },
        { title: 'Angular', value: 'angular' },
        { title: 'Different', value: '' },
      ],
      initial,
      message: 'Select framework',
      name: 'chosen',
      type: 'select',
    },
    { onCancel: cancelAction },
  );

  return chosen;
}

export async function selectInstall(args) {
  if (args.includes('--install')) {
    return true;
  }
  if (args.includes('--no-install')) {
    return false;
  }

  const { shouldInstall } = await prompts(
    {
      initial: true,
      message: 'Install dependencies',
      name: 'shouldInstall',
      type: 'confirm',
    },
    { onCancel: cancelAction },
  );

  return shouldInstall;
}

export async function selectOverrideFile(file) {
  const { override } = await prompts(
    {
      initial: true,
      message: `Overwrite ${file}`,
      name: 'override',
      type: 'confirm',
    },
    { onCancel: cancelAction },
  );

  return override;
}

export async function selectScriptsEnvironment() {
  const { useDocker } = await prompts(
    {
      choices: [
        { title: 'Locally', value: 'local' },
        { title: 'Docker', value: 'docker' },
      ],
      initial: existsSync('/.dockerenv') ? 1 : 0,
      message: 'Script environment',
      name: 'useDocker',
      type: 'select',
    },
    { onCancel: cancelAction },
  );

  return useDocker;
}
