import { CheckOrder } from './check-order.js';
import { ConfigResolver } from './config/config-resolver.js';
import { PluginError } from './output/errors.js';
import { reportError } from './output/output-helpers.js';

export function create(config) {
  return {
    create(context) {
      const filename = context.filename ?? context.getFilename?.() ?? '';
      const sourceCode = context.sourceCode ?? context.getSourceCode?.();

      let programConfig;

      try {
        const configResolver = new ConfigResolver(filename, config);
        programConfig = configResolver.getConfig();
      } catch (error) {
        if (error instanceof PluginError) {
          reportError(error);

          return {};
        }

        throw error;
      }

      if (!programConfig) {
        return {};
      }

      return {
        Program(program) {
          try {
            const errors = new CheckOrder(program.body, { context, filename, sourceCode }, programConfig).run();

            errors
              .sort((a, b) => a.node.loc.start.line - b.node.loc.start.line)
              .forEach((error) => context.report(error));
          } catch (error) {
            if (error instanceof PluginError) {
              reportError(error);
            } else {
              throw error;
            }
          }
        },
      };
    },

    meta: {
      docs: {
        description: 'Enforces the order of blocks in Vue projects',
      },
      schema: [],
      type: 'problem',
    },
  };
}
