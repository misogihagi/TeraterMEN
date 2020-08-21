module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    'standard',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    "linebreak-style": [
      2,
      "unix"
    ],
  }
}
