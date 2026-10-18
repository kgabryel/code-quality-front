import pkg from '@eslint/js';

const { configs: eslintConfigs } = pkg;
import prettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import sonarjs from 'eslint-plugin-sonarjs';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import fs from 'node:fs';
import path from 'node:path';
import { messageBox, OutputColor } from '../scripts/output.js';
import JSONminify from 'node-json-minify';

export const baseExtends = [
  eslintConfigs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  prettier,
];

export const basePlugins = {
  perfectionist,
  sonarjs,
  'unused-imports': unusedImports,
};

export const baseRules = {
  '@typescript-eslint/ban-ts-comment': ['error'],
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-function-return-type': ['error'],
  '@typescript-eslint/no-deprecated': 'error',
  '@typescript-eslint/no-duplicate-enum-values': 'error',
  '@typescript-eslint/no-empty-function': 'error',
  '@typescript-eslint/no-empty-object-type': 'error',
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-inferrable-types': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  '@typescript-eslint/no-non-null-assertion': 'error',
  'comma-dangle': ['error', 'always-multiline'],
  'eol-last': ['error', 'always'],
  'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'padding-line-between-statements': [
    'error',
    { blankLine: 'always', next: '*', prev: 'import' },
    { blankLine: 'any', next: 'import', prev: 'import' },
    { blankLine: 'always', next: 'export', prev: '*' },
    { blankLine: 'always', next: 'return', prev: '*' },
    { blankLine: 'always', next: 'block-like', prev: ['const', 'let', 'var'] },
  ],
  'perfectionist/sort-enums': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-exports': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-imports': ['error', { order: 'asc', type: 'natural' }],
  'perfectionist/sort-objects': ['error', { order: 'asc', type: 'natural' }],
  quotes: ['error', 'single'],
  semi: ['error', 'always'],
  'sonarjs/cognitive-complexity': ['error', 10],
  'spaced-comment': ['error', 'always'],
  'unused-imports/no-unused-imports': 'error',
};

export class BaseConfigBuilder {
  #config;
  #extends;
  #overrides;

  constructor() {
    this.#config = {
      files: [],
      ignores: [],
      rules: {},
    };
    this.#extends = [];
    this.#overrides = [];
  }

  addOverride(config) {
    this.#overrides = [...this.#overrides, config];

    return this;
  }

  get() {
    return [...this.#extends, this.#config, ...this.#overrides];
  }

  removeRule(rule) {
    const { [rule]: _, ...rest } = this.#config.rules;
    this.#config = { ...this.#config, rules: rest };

    return this;
  }

  setExtends(extendsConfig) {
    this.#extends = extendsConfig;

    return this;
  }

  setIgnoresFiles(ignores) {
    return this.#setConfig('ignores', ignores);
  }

  setLanguageOptions(languageOptions) {
    return this.#setConfig('languageOptions', languageOptions);
  }

  setPlugins(plugins) {
    return this.#setConfig('plugins', plugins);
  }

  setRule(rule, configuration) {
    this.#config = {
      ...this.#config,
      rules: { ...this.#config.rules, [rule]: configuration },
    };

    return this;
  }

  setRules(rules) {
    return this.#setConfig('rules', rules);
  }

  setWatchedFiles(files) {
    return this.#setConfig('files', files);
  }

  useTsConfig(configPath) {
    try {
      const tsConfig = JSON.parse(JSONminify(fs.readFileSync(path.resolve(process.cwd(), configPath), 'utf8')));

      if (tsConfig.include && Array.isArray(tsConfig.include)) {
        this.setWatchedFiles(tsConfig.include);
      }

      if (tsConfig.exclude && Array.isArray(tsConfig.exclude)) {
        const formattedExcludes = tsConfig.exclude.map((item) => {
          if (item.endsWith('/') || item.includes('*')) {
            return item;
          }

          return item.includes('.') && !item.startsWith('.') ? item : `${item}/`;
        });

        this.setIgnoresFiles(formattedExcludes);
      }
    } catch (error) {
      console.error(
        messageBox(
          {
            content: [
              'Nie udało się załadować ani sparsować pliku TSConfig.',
              `Detal błędu: ${error instanceof Error ? error.message : String(error)}`,
            ],
            footer: `Sprawdź, czy plik istnieje pod ścieżką: ${configPath}`,
            kind: 'TSCONFIG_LOAD_FAILED',
            source: this.constructor.name,
          },
          OutputColor.ERROR,
        ),
      );

      process.exit(1);
    }

    return this;
  }

  #setConfig(key, value) {
    this.#config = { ...this.#config, [key]: value };

    return this;
  }
}

export function createConfig() {
  return new BaseConfigBuilder();
}
