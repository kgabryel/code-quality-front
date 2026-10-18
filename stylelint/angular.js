export default {
  extends: ['./base.js'],
  rules: {
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['ng-deep'] }],
    'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['ng-deep'] }],
  },
};
