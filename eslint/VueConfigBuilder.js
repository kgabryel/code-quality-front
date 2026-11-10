import pluginVue from 'eslint-plugin-vue';
import vuetify from 'eslint-plugin-vuetify';

import { BaseConfigBuilder, baseExtends, basePlugins, baseRules } from './BaseConfigBuilder.js';
import { create } from './plugins/vue-order/index.js';

export const vueExtends = [
  ...baseExtends,
  ...pluginVue.configs['flat/recommended'],
  ...vuetify.configs['flat/base'],
  ...vuetify.configs['flat/recommended'],
];

export const vuePlugins = (vueOrderConfig = {}) => {
  const plugins = { ...basePlugins };

  if (Object.keys(vueOrderConfig).length > 0) {
    plugins['vue-order'] = {
      rules: {
        'vue-order': create(vueOrderConfig),
      },
    };
  }

  return plugins;
};

export const vueRules = {
  ...baseRules,
  '@typescript-eslint/typedef': [
    'error',
    {
      arrowParameter: true,
      memberVariableDeclaration: true,
      parameter: true,
      propertyDeclaration: true,
      variableDeclaration: true,
      variableDeclarationIgnoreFunction: true,
    },
  ],
  'vue-order/vue-order': 'error',
  'vue/block-order': [
    'error',
    {
      order: ['script', 'template', 'style'],
    },
  ],
  'vue/component-name-in-template-casing': ['error', 'PascalCase'],
  'vue/no-unused-vars': 'error',
  'vue/no-v-html': 'error',
  'vue/order-in-components': 'error',
  'vue/padding-line-between-blocks': ['error', 'always'],
  'vue/singleline-html-element-content-newline': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/html-self-closing': 'off',
};

export class VueConfigBuilder extends BaseConfigBuilder {
  get() {
    const config = super.get();
    if (config.plugins && !config.plugins['vue-order']) {
      delete config.rules?.['vue-order/vue-order'];
    }

    return config;
  }
}

export function createConfig() {
  return new VueConfigBuilder();
}
