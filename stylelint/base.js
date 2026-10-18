export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-order'],
  rules: {
    'block-no-empty': true,
    'color-hex-length': 'short',
    'declaration-block-no-duplicate-properties': true,
    'max-nesting-depth': 3,
    'order/properties-alphabetical-order': true,
    'scss/at-mixin-pattern': '^[a-z0-9\\-]+$',
    'scss/dollar-variable-pattern': '^[a-z0-9\\-]+$',
    'scss/load-no-partial-leading-underscore': true,
    'scss/percent-placeholder-pattern': '^[a-z0-9\\-]+$',
  },
};
