import base from './base.js';

export default {
  ...base,
  overrides: [
    ...base.overrides,
    {
      files: '*.component.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
