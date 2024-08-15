
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js', '!**/*.spec.js'],
        ignores: [
            'coverage',
        ],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                fetch: 'readonly',
                after: 'readonly',
                afterEach: 'readonly',
                before: 'readonly',
                beforeEach: 'readonly',
                context: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                xdescribe: 'readonly',
                xit: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'eqeqeq': 'error',
            'no-underscore-dangle': 'off',
            'guard-for-in': 'error',
            'no-extend-native': 'error',
            'wrap-iife': 'error',
            'new-cap': 'error',
            'no-caller': 'error',
            'semi': ['error', 'always'],
            'strict': ['error', 'global'],
            'quotes': ['warn', 'single'],
            'no-loop-func': 'error',
            'no-irregular-whitespace': 'warn',
            'no-multi-spaces': 'error',
            'one-var': ['error', 'never'],
            'constructor-super': 'error',
            'no-this-before-super': 'error',
            'no-var': 'error',
            'prefer-const': 'warn',
            'no-const-assign': 'error',
        },
    },
    {
        files: ['**/*.test.js'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                ...globals.jest,
                fetch: 'readonly',
            },
        },
        rules: {
            'no-unused-vars': 'off',
            'no-undef': 'off',
        },
    },
];
