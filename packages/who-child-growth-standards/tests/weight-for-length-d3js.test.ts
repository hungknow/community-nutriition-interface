import { describe, it, expect, beforeEach } from "vitest";
import { d3js_weight_for_length, calculateWeightFromLMS } from "../src/weight-for-length-d3js";
import { weightForLengthGirlBirthTo2Years } from "../src/weight-for-length-0-to-2-years";
import { exportSvgToPng } from "./export-png";
import * as fs from "fs";
import * as path from "path";

/**
 * Unit tests for d3js_weight_for_length function
 * 
 * These tests verify that:
 * 1. The function creates a valid SVG chart
 * 2. All z-score curves are rendered
 * 3. Chart elements (axes, labels, legend) are present
 * 4. The chart can be exported to PNG
 */
describe("d3js_weight_for_length", () => {
  // Create a container element for each test
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement("div");
    container.id = "test-chart-container";
    document.body.appendChild(container);
  });

  it("should create a chart with default options", () => {
    // Execute the function
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
    });

    // Verify SVG was created
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe("800");
    expect(svg?.getAttribute("height")).toBe("600");
  });

  it("should create a chart with custom dimensions", () => {
    const customWidth = 1000;
    const customHeight = 800;

    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      width: customWidth,
      height: customHeight,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("width")).toBe(String(customWidth));
    expect(svg?.getAttribute("height")).toBe(String(customHeight));
  });

  it("should render all z-score curves", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Check for all 7 z-score curves (-3SD to +3SD)
    const zScoreKeys = ["sd3neg", "sd2neg", "sd1neg", "sd0", "sd1", "sd2", "sd3"];
    zScoreKeys.forEach((key) => {
      const path = svg?.querySelector(`.z-score-${key}`);
      expect(path).toBeTruthy();
      expect(path?.tagName).toBe("path");
    });
  });

  it("should render axes", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Check for X-axis
    const xAxis = svg?.querySelector(".x-axis");
    expect(xAxis).toBeTruthy();

    // Check for Y-axis
    const yAxis = svg?.querySelector(".y-axis");
    expect(yAxis).toBeTruthy();
  });

  it("should render axis labels", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      xAxisLabel: "Length (cm)",
      yAxisLabel: "Weight (kg)",
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Check X-axis label - it's the last text element in the x-axis group
    const xAxis = svg?.querySelector(".x-axis");
    const xAxisTexts = xAxis?.querySelectorAll("text");
    const xAxisLabel = xAxisTexts?.[xAxisTexts.length - 1];
    expect(xAxisLabel?.textContent).toBe("Length (cm)");

    // Check Y-axis label - it's the last text element in the y-axis group
    const yAxis = svg?.querySelector(".y-axis");
    const yAxisTexts = yAxis?.querySelectorAll("text");
    const yAxisLabel = yAxisTexts?.[yAxisTexts.length - 1];
    expect(yAxisLabel?.textContent).toBe("Weight (kg)");
  });

  it("should render title and subtitle", () => {
    const title = "Weight-for-length";
    const subtitle = "Girls, Birth to 2 years";

    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      title,
      subtitle,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Check title (first text element)
    const textElements = svg?.querySelectorAll("text");
    expect(textElements?.length).toBeGreaterThan(0);
    
    // Title should be present
    const titleText = Array.from(textElements || []).find(
      (el) => el.textContent === title
    );
    expect(titleText).toBeTruthy();

    // Subtitle should be present
    const subtitleText = Array.from(textElements || []).find(
      (el) => el.textContent === subtitle
    );
    expect(subtitleText).toBeTruthy();
  });

  it("should render legend when enabled", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      showLegend: true,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    const legend = svg?.querySelector(".legend");
    expect(legend).toBeTruthy();
  });

  it("should not render legend when disabled", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      showLegend: false,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    const legend = svg?.querySelector(".legend");
    expect(legend).toBeFalsy();
  });

  it("should render grid lines when enabled", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      showGrid: true,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    const gridLines = svg?.querySelectorAll(".grid line");
    expect(gridLines?.length).toBeGreaterThan(0);
  });

  it("should not render grid lines when disabled", () => {
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      showGrid: false,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    const gridLines = svg?.querySelectorAll(".grid line");
    expect(gridLines?.length).toBe(0);
  });

  it("should use custom colors when provided", () => {
    const customColors = {
      sd0: "#ff0000", // Red for median
      sd1: "#00ff00", // Green for +1SD
    };

    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      colors: customColors,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Check that custom color for median is applied
    const medianPath = svg?.querySelector(".z-score-sd0");
    expect(medianPath?.getAttribute("stroke")).toBe("#ff0000");
  });

  it("should throw error for empty data", () => {
    expect(() => {
      d3js_weight_for_length([], {
        container: container,
      });
    }).toThrow("Data array cannot be empty");
  });

  it("should throw error for invalid container selector", () => {
    expect(() => {
      d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
        container: "#non-existent-element",
      });
    }).toThrow('Container element "#non-existent-element" not found');
  });

  it("should export chart to PNG", async () => {
    // Create chart
    d3js_weight_for_length(weightForLengthGirlBirthTo2Years, {
      container: container,
      title: "Weight-for-length",
      subtitle: "Girls, Birth to 2 years",
      width: 900,
      height: 700,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Export to PNG
    const outputPath = path.join(__dirname, "output", "weight-for-length-girls.png");
    await exportSvgToPng(svg as SVGElement, outputPath, 900, 700);

    // Verify PNG file was created
    expect(fs.existsSync(outputPath)).toBe(true);

    // Verify file is not empty
    const stats = fs.statSync(outputPath);
    expect(stats.size).toBeGreaterThan(0);
  }, 30000); // Increase timeout for PNG export

  it("should calculate weights using LMS method correctly", () => {
    // Test with first data point from the dataset
    // For length 45cm: l=-0.3833, m=2.4607, s=0.09029
    const testData = weightForLengthGirlBirthTo2Years[0];
    const { l, m, s } = testData;

    // Test LMS calculation for median (z-score = 0)
    // Median should equal M when z-score is 0
    const medianWeight = calculateWeightFromLMS(l, m, s, 0);
    expect(medianWeight).toBeCloseTo(m, 1); // Should be very close to m

    // Test LMS calculation for z-scores and compare with expected values
    // Note: There may be small rounding differences, so we check with tolerance
    const zScoreTests = [
      { z: -3, expected: testData.sd3neg, tolerance: 0.2 },
      { z: -2, expected: testData.sd2neg, tolerance: 0.2 },
      { z: -1, expected: testData.sd1neg, tolerance: 0.2 },
      { z: 0, expected: testData.sd0, tolerance: 0.2 },
      { z: 1, expected: testData.sd1, tolerance: 0.2 },
      { z: 2, expected: testData.sd2, tolerance: 0.2 },
      { z: 3, expected: testData.sd3, tolerance: 0.2 },
    ];

    zScoreTests.forEach(({ z, expected, tolerance }) => {
      const calculated = calculateWeightFromLMS(l, m, s, z);
      // Verify the value is within tolerance (pre-calculated values may have rounding)
      expect(Math.abs(calculated - expected)).toBeLessThan(tolerance);
      // Also verify it's a reasonable value (positive and finite)
      expect(calculated).toBeGreaterThan(0);
      expect(Number.isFinite(calculated)).toBe(true);
    });

    // Verify that the chart renders correctly with LMS
    d3js_weight_for_length([testData], {
      container: container,
    });

    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();

    // Verify that z-score curves are rendered (LMS method should produce valid curves)
    const zScoreKeys = ["sd3neg", "sd2neg", "sd1neg", "sd0", "sd1", "sd2", "sd3"];
    zScoreKeys.forEach((key) => {
      const path = svg?.querySelector(`.z-score-${key}`);
      expect(path).toBeTruthy();
    });
  });

  it("should export multiple chart variations to PNG", async () => {
    const variations = [
      {
        name: "with-grid-and-legend",
        options: {
          container: container,
          showGrid: true,
          showLegend: true,
          title: "Weight-for-length (with grid and legend)",
        },
      },
      {
        name: "without-grid-and-legend",
        options: {
          container: container,
          showGrid: false,
          showLegend: false,
          title: "Weight-for-length (minimal)",
        },
      },
      {
        name: "custom-colors",
        options: {
          container: container,
          colors: {
            sd0: "#0066cc",
            sd1: "#0099ff",
            sd2: "#00ccff",
          },
          title: "Weight-for-length (custom colors)",
        },
      },
    ];

    for (const variation of variations) {
      // Clear container
      container.innerHTML = "";

      // Create chart
      d3js_weight_for_length(weightForLengthGirlBirthTo2Years, variation.options);

      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();

      // Export to PNG
      const outputPath = path.join(
        __dirname,
        "output",
        `weight-for-length-${variation.name}.png`
      );
      await exportSvgToPng(svg as SVGElement, outputPath, 800, 600);

      // Verify PNG file was created
      expect(fs.existsSync(outputPath)).toBe(true);
    }
  }, 60000); // Increase timeout for multiple PNG exports
});
