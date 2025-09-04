/** @type {import("prettier").Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  jsxSingleQuote: false,
  endOfLine: 'lf',
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
  ],
};
