module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  globals: {
    BigInt: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'max-classes-per-file': 'off',
    'lines-between-class-members': [
      'error',
      {
        enforce: [{ blankLine: 'always', prev: 'method', next: 'method' }],
      },
    ],
    'import/extensions': ['error', 'always', { ignorePackages: true }],
  },
};
