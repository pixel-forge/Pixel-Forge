import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Both of these guard ESM-only publishing rather than style.
 *
 * Default exports break `require(esm)` consumers, who receive a module namespace
 * object rather than the exported value.
 *
 * Top-level await makes `require()` throw ERR_REQUIRE_ASYNC_MODULE. These
 * selectors match the realistic shapes for fast feedback; the require() smoke
 * test before publish is the actual guarantee, since it also covers TLA reached
 * through dependencies.
 */
const publishedSourceRestrictions = [
  {
    selector: 'ExportDefaultDeclaration',
    message:
      'Default exports are banned: require(esm) consumers receive a namespace object, so `require(pkg)` would not be the exported value. Use a named export.',
  },
  ...[
    'Program > ExpressionStatement > AwaitExpression',
    'Program > VariableDeclaration > VariableDeclarator > AwaitExpression',
    'Program > ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > AwaitExpression',
    'Program > ForOfStatement[await=true]',
  ].map((selector) => ({
    selector,
    message:
      'Top-level await is banned: it makes this package throw ERR_REQUIRE_ASYNC_MODULE for require() consumers. Use a lazy import() inside a function instead.',
  })),
];

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.d.ts'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,mts}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // Published source only. Tests and build configs may use default exports.
    files: ['packages/*/src/**/*.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...publishedSourceRestrictions],
    },
  },
  {
    files: [
      '**/*.config.{ts,mts,mjs}',
      'configs/**/*.ts',
      'eslint.config.mjs',
      'scripts/**/*.mjs',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
);
