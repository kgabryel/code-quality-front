import { run } from './utils.js';

const commonDeps = {
  eslint: [
    '@eslint/js',
    'eslint',
    'eslint-config-prettier',
    'eslint-plugin-perfectionist',
    'eslint-plugin-sonarjs',
    'eslint-plugin-unused-imports',
    'globals',
    'typescript-eslint',
  ],
  prettier: ['prettier'],
  stylelint: ['stylelint', 'stylelint-config-standard-scss', 'stylelint-order'],
  tsconfig: ['typescript'],
};

const frameworkDeps = {
  angular: {
    eslint: ['angular-eslint'],
    stylelint: [],
  },
  vue: {
    eslint: ['eslint-plugin-vue', 'eslint-plugin-vuetify', 'postcss-html'],
    stylelint: [],
  },
};

export function getDepsToInstall(framework, features) {
  return features.flatMap((feature) => [
    ...(commonDeps[feature] ?? []),
    ...(frameworkDeps[framework]?.[feature] ?? []),
  ]);
}

export function installDependencies(dependencies) {
  const deps = dependencies.join(' ');
  run(`npm install --save-dev ${deps}`);
}
