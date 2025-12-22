const { createDefaultPreset } = require("ts-jest");

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  }
}
