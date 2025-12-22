/**
 * Mock implementation of d3 for Jest tests
 * 
 * This mock provides basic implementations of d3 functions used in the codebase
 * to prevent errors during testing without requiring the full d3 library.
 */

// Mock d3.select - returns a chainable selection object
const createMockSelection = () => {
  const selection = {
    node: jest.fn(() => null),
    selectAll: jest.fn(() => selection),
    remove: jest.fn(() => selection),
    append: jest.fn(() => selection),
    attr: jest.fn(() => selection),
    style: jest.fn(() => selection),
    text: jest.fn(() => selection),
    datum: jest.fn(() => selection),
    call: jest.fn(() => selection),
    select: jest.fn(() => selection),
  };
  return selection;
};

// Mock d3.scaleLinear
const createMockScale = () => {
  const scale = jest.fn((value) => value);
  scale.domain = jest.fn(() => scale);
  scale.range = jest.fn(() => scale);
  scale.nice = jest.fn(() => scale);
  return scale;
};

// Mock d3.axisBottom and d3.axisLeft
const createMockAxis = () => {
  const axis = jest.fn();
  axis.tickSize = jest.fn(() => axis);
  axis.tickSizeOuter = jest.fn(() => axis);
  axis.tickFormat = jest.fn(() => axis);
  return axis;
};

// Mock d3.line
const createMockLine = () => {
  const line = jest.fn(() => '');
  line.x = jest.fn(() => line);
  line.y = jest.fn(() => line);
  line.curve = jest.fn(() => line);
  return line;
};

module.exports = {
  select: jest.fn(() => createMockSelection()),
  min: jest.fn((array) => (array && array.length > 0 ? Math.min(...array) : undefined)),
  max: jest.fn((array) => (array && array.length > 0 ? Math.max(...array) : undefined)),
  scaleLinear: jest.fn(() => createMockScale()),
  axisBottom: jest.fn(() => createMockAxis()),
  axisLeft: jest.fn(() => createMockAxis()),
  line: jest.fn(() => createMockLine()),
  curveMonotoneX: {},
};
