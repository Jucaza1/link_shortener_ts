// /** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/build/tests/**/*.js'], // Run the compiled JS tests
  moduleFileExtensions: ['js'],
  transform: {}, // Do not transform files (no ts-jest or babel needed)
  transformIgnorePatterns: [
    "/node_modules/",
  ],
};
// export default {
//     preset: 'ts-jest',
//     moduleFileExtensions: ['ts', 'js', 'json'],
//     testEnvironment: "node",
//     transform: {
//         // "^.+.ts$": ["ts-jest", {}],
//         '^.+\\.ts$': 'ts-jest',
//     },
//     // transformIgnorePatterns: [
//     //     // Prevent transforming anything in node_modules
//     //     '/node_modules/',
//     // ],
//     testMatch: ['**/*.test.ts'],
//     moduleNameMapper: {
//         "(.+)\\.[jt]s": "$1"
//     },
//     extensionsToTreatAsEsm: [".ts"],
//     // transformIgnorePatterns: [
//     //     "/node_modules/",  // Ignore all node_modules
//     // ],
//     // moduleNameMapper: {
//     //     "^~(.*)$": "<rootDir>/src/$1"
//     // }
//     // moduleNameMapper: {
//     //     '^(\\.{1,2}/.*)\\.js$': '$1.ts',
//     // }
// };
