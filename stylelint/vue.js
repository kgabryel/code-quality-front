export default {
  customSyntax: 'postcss-html',
  extends: ['./base.js'],
  rules: {
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep', 'global', 'slotted'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['deep', 'global', 'slotted'] }],
  },
};
