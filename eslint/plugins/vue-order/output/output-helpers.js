import { messageBox, OutputColor } from '../../../../scripts/output.js';

export const PLUGIN_SOURCE = 'vue-order/vue-order';

export function reportError(error) {
  console.error(
    messageBox(
      {
        content: error.content ?? [error.message],
        footer: error.fix === undefined ? [] : Array.isArray(error.fix) ? error.fix : [error.fix],
        kind: error.name,
        source: PLUGIN_SOURCE,
      },
      OutputColor.ERROR,
    ),
  );

  process.exit(1);
}

export function reportWarning(content, footer = []) {
  console.warn(
    messageBox(
      {
        content: content,
        footer: footer,
        kind: 'Warning',
        source: PLUGIN_SOURCE,
      },
      OutputColor.WARNING,
    ),
  );
}
