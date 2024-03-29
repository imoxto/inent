/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:@next/next/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    camelcase: "off",
    indent: "off",
    "@next/next/no-img-element": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "arrow-body-style": "off",
    "arrow-parens": "off",
    "brace-style": "off",
    "class-methods-use-this": "off",
    "comma-dangle": ["error", "never"],
    "consistent-return": "off",
    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false,
        },
        extendDefaults: true,
      },
    ],
    "react/no-unstable-nested-components": "off",
    "react/jsx-wrap-multilines": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-quotes": ["error", "prefer-single"],
    "max-classes-per-file": "off",
    "max-len": [
      "error",
      {
        code: 150,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    "no-alert": "off",
    "no-confusing-arrow": "off",
    "no-else-return": "off",
    "no-multiple-empty-lines": [
      "error",
      {
        max: 1,
      },
    ],
    "no-nested-ternary": "off",
    "no-param-reassign": "off",
    "no-prototype-builtins": "off",
    "no-plusplus": [
      "error",
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    "no-restricted-syntax": "off",
    "no-underscore-dangle": "off",
    "no-unused-vars": "off",
    "no-use-before-define": [
      "error",
      {
        functions: false,
      },
    ],
    "no-await-in-loop": "off",
    "no-throw-literal": "off",
    "object-curly-newline": "off",
    "padded-blocks": "off",
    "prefer-destructuring": "off",
    "prefer-promise-reject-errors": "off",
    radix: "off",
    "space-before-function-paren": "off",
    "react/destructuring-assignment": "off",
    "react/jsx-boolean-value": "off",
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".tsx", ".jsx"],
      },
    ],
    "react/jsx-no-bind": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-props-no-spreading": "off",
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/require-default-props": "off",
    "react/react-in-jsx-scope": "off",
    "react/self-closing-comp": "off",
    "react/state-in-constructor": "off",
    "no-bitwise": "warn",
    "no-undef": "off",
    "jsx-a11y/alt-text": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "no-shadow": "error",
    "@typescript-eslint/no-shadow": "error",
    "implicit-arrow-linebreak": "off",
    "function-paren-newline": "off",
    "operator-linebreak": "off",
    "react/jsx-curly-newline": "off",
  },
  overrides: [
    {
      files: ["stories/**/*.stories.tsx"],
      rules: {
        "react/function-component-definition": "off",
      },
    },
    {
      files: ["./jest.config.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
