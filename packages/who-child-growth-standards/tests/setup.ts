/**
 * Test setup file for Vitest
 * Configures jsdom environment for D3.js testing
 */
import { afterEach } from "vitest";

// Cleanup after each test - remove any DOM elements created during tests
afterEach(() => {
  // Clear the document body
  document.body.innerHTML = "";
});
