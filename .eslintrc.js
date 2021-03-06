/**
 * eslint
 *
 * @file eslint.js
 * @author guyunlong
 */

module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-console": 0,
        "no-cond-assign" : 0,
        "no-debugger": 0,
        "no-global-assign": 0,
        "no-empty": 0,
        "no-unused-vars": 0,
        "no-extra-semi": 0,
        "no-global-assign": 0
    }
};