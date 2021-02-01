module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  watchPathIgnorePatterns:[
    ".*/node_modules/.*",
    "<rootDir>/src/img/"
  ]
}