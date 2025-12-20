# Tests for Weight-for-Length D3.js Visualization

This directory contains unit tests for the `d3js_weight_for_length` function.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Test Coverage

The test suite covers:

1. **Basic functionality**
   - Chart creation with default options
   - Chart creation with custom dimensions
   - Error handling for empty data
   - Error handling for invalid container selectors

2. **Chart elements**
   - Z-score curves rendering (all 7 curves: -3SD to +3SD)
   - X and Y axes rendering
   - Axis labels
   - Title and subtitle
   - Grid lines (toggle on/off)
   - Legend (toggle on/off)
   - Custom colors

3. **PNG export**
   - Export chart to PNG file
   - Export multiple chart variations to PNG

## PNG Output

Test PNG files are generated in the `output/` directory:

- `weight-for-length-girls.png` - Basic chart with default settings
- `weight-for-length-with-grid-and-legend.png` - Chart with grid and legend enabled
- `weight-for-length-without-grid-and-legend.png` - Minimal chart without grid/legend
- `weight-for-length-custom-colors.png` - Chart with custom color scheme

These files are automatically generated during test execution and are excluded from git via `.gitignore`.

## Test Structure

- `weight-for-length-d3js.test.ts` - Main test file with all unit tests
- `export-png.ts` - Helper utility for exporting SVG to PNG using Playwright
- `setup.ts` - Vitest setup file for jsdom environment configuration

## Dependencies

- **Vitest** - Testing framework
- **jsdom** - DOM environment for Node.js
- **Playwright** - Browser automation for PNG export

## Notes

- PNG export tests have longer timeouts (30-60 seconds) due to browser launch overhead
- The `output/` directory is created automatically if it doesn't exist
- PNG files are regenerated on each test run
