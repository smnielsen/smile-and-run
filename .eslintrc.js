module.exports = {
  extends: ['standard', 'prettier'],
  plugins: [
    'mocha',
    'promise',
    'import',
    'security',
    'chai-expect',
    'chai-friendly',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    semi: 0,
    'no-multiple-empty-lines': [2, { max: 2 }],
    'space-before-function-paren': 0,
    // error
    'mocha/no-exclusive-tests': 'error',
    'mocha/no-identical-title': 'error',
    'mocha/no-nested-tests': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-cycle': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // warning
    'no-warning-comments': 'warn',
    'mocha/no-pending-tests': 'warn',
    'mocha/no-skipped-tests': 'warn',

    // annoying
    'no-shadow': 'off',
    'prefer-destructuring': 'off',

    // chai stuff
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'chai-expect/missing-assertion': 2,
    'chai-expect/terminating-properties': 1,

    // security stuff
    'security/detect-object-injection': 'off',
  },
};
