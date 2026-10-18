import angular from 'angular-eslint';

import { BaseConfigBuilder, baseExtends, basePlugins, baseRules } from './BaseConfigBuilder.js';

export const angularExtends = [...baseExtends, ...angular.configs.tsRecommended];

export const angularPlugins = {
  ...basePlugins,
};

export const angularRules = {
  ...baseRules,
  '@angular-eslint/directive-selector': ['error', { prefix: 'app', style: 'camelCase', type: 'attribute' }],
  '@angular-eslint/no-empty-lifecycle-method': 'error',
  '@angular-eslint/prefer-inject': 'off',
  '@angular-eslint/use-lifecycle-interface': 'error',
  '@typescript-eslint/explicit-member-accessibility': [
    'error',
    {
      accessibility: 'explicit',
      overrides: {
        constructors: 'explicit',
      },
    },
  ],
  '@typescript-eslint/member-ordering': [
    'error',
    {
      default: [
        'signature',
        'public-static-field',
        'protected-static-field',
        'private-static-field',
        'public-decorated-field',
        'protected-decorated-field',
        'private-decorated-field',
        'public-instance-field',
        'protected-instance-field',
        'private-instance-field',
        'constructor',
        'public-static-method',
        'protected-static-method',
        'private-static-method',
        'public-decorated-method',
        'protected-decorated-method',
        'private-decorated-method',
        'public-instance-method',
        'protected-instance-method',
        'private-instance-method',
      ],
    },
  ],
  '@typescript-eslint/typedef': [
    'error',
    {
      arrowParameter: true,
      memberVariableDeclaration: false,
      parameter: false,
      propertyDeclaration: false,
      variableDeclaration: false,
    },
  ],
  'sonarjs/no-duplicate-string': 'error',
};

export const templateConfig = {
  extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  files: ['**/*.html'],
  rules: {
    '@angular-eslint/template/click-events-have-key-events': 'off',
    '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 10 }],
    '@angular-eslint/template/eqeqeq': 'error',
    '@angular-eslint/template/interactive-supports-focus': 'off',
    '@angular-eslint/template/no-any': 'error',
    '@angular-eslint/template/no-inline-styles': 'off',
    '@angular-eslint/template/no-negated-async': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/adjacent-overload-signatures': 'off'
  },
};

export class AngularConfigBuilder extends BaseConfigBuilder {
  setPrefixes(prefixes) {
    return this.setRule('@angular-eslint/component-selector', [
      'error',
      {
        prefix: prefixes,
        style: 'kebab-case',
        type: 'element',
      },
    ]).setRule('@angular-eslint/directive-selector', [
      'error',
      {
        prefix: prefixes,
        style: 'camelCase',
        type: 'attribute',
      },
    ]);
  }
}

export function createConfig() {
  return new AngularConfigBuilder();
}
