import { createConfig, baseRules, baseExtends, basePlugins } from '@kgabryel/code-quality/eslint/BaseConfigBuilder';
import globals from 'globals';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json')
  .setRules(baseRules)
  .setExtends(baseExtends)
  .setPlugins(basePlugins)
  .setLanguageOptions({
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  });
export default config.get();
