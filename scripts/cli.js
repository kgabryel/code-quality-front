#!/usr/bin/env node
import { getDepsToInstall, installDependencies } from './dependencies.js';
import {
  selectBasePath,
  selectContainerName,
  selectCreateScripts,
  selectFeatures,
  selectFramework,
  selectInstall,
  selectScriptsEnvironment,
} from './prompts.js';
import { createDockerScripts, createLocalScripts } from './shell-scripts.js';
import { copy, getResourcePath } from './utils.js';

const args = process.argv.slice(2);

async function main() {
  const framework = await selectFramework(args);
  const features = await selectFeatures();
  const basePath = await selectBasePath();
  const shouldInstall = await selectInstall(args);

  if (shouldInstall) {
    const deps = getDepsToInstall(framework, features);

    if (deps.length > 0) {
      console.log('\nInstalling dependencies...\n');
      installDependencies(deps);
    }
  }

  console.log('\nCopying files...\n');

  if (features.includes('editorconfig')) {
    await copy(getResourcePath('.editorconfig'), '.editorconfig', basePath);
  }

  if (features.includes('tsconfig')) {
    await copy(getResourcePath('tsconfig.json', framework), 'tsconfig.json', basePath);
  }

  if (features.includes('eslint')) {
    await copy(getResourcePath('eslint.config.js', framework), 'eslint.config.js', basePath);
    await copy(getResourcePath('tsconfig.eslint.json', framework), 'tsconfig.eslint.json', basePath);
  }

  if (features.includes('prettier')) {
    await copy(getResourcePath('prettier.config.js', framework), 'prettier.config.js', basePath);
    await copy(getResourcePath('.prettierignore', framework), '.prettierignore', basePath);
  }

  if (features.includes('stylelint')) {
    await copy(getResourcePath('stylelint.config.js', framework), 'stylelint.config.js', basePath);
  }

  const featuresWithScripts = ['tsconfig', 'eslint', 'prettier', 'stylelint'];
  const hasScripts = features.some((feature) => featuresWithScripts.includes(feature));

  if (!hasScripts) {
    console.log('\nDone!\n');

    return;
  }

  console.log();

  const shouldCreateScripts = await selectCreateScripts();

  if (!shouldCreateScripts) {
    return;
  }

  const environment = await selectScriptsEnvironment();
  const containerName = environment === 'docker' ? await selectContainerName() : null;

  console.log('\nCreating scripts...\n');

  if (environment === 'docker') {
    await createDockerScripts(framework, basePath, containerName, features);
  } else {
    await createLocalScripts(framework, basePath, features);
  }

  console.log('\nDone!\n');
}

await main();
