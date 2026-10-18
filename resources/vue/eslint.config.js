import { vueOrderConfig } from '@kgabryel-dev/code-quality/eslint/plugins/vue-order/example.config';
import { createConfig, vueRules, vueExtends, vuePlugins } from '@kgabryel-dev/code-quality/eslint/VueConfigBuilder';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json')
  .setRules(vueRules)
  .setExtends(vueExtends)
  .setPlugins(vuePlugins(vueOrderConfig))
  .setLanguageOptions({
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      extraFileExtensions: ['.vue'],
      parser: tseslint.parser,
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  });

export default config.get();
