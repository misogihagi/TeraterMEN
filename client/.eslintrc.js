module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  overrides: [
    {
      files: ['src/**/*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'svelte3'
  ],
  rules: {
    "indent": [
      2,
      "tab"
    ],
    "linebreak-style": [
      2,
      "unix"
    ],
  },
};
