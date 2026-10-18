import {
  createConfig,
  angularRules,
  templateConfig,
  angularExtends,
  angularPlugins,
} from '@kgabryel/code-quality/eslint/AngularConfigBuilder';
import globals from 'globals';

const config = createConfig()
  .useTsConfig('./tsconfig.eslint.json')
  .setRules(angularRules)
  .setExtends(angularExtends)
  .setPlugins(angularPlugins)
  .setLanguageOptions({
    globals: {
      ...globals.browser,
    },
    parserOptions: {
      project: ['./tsconfig.eslint.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  })
  .setPrefixes(['app'])
  .addOverride(templateConfig);

export default config.get();
