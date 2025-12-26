import type { WeightForLength } from "./types";
import * as d3 from "d3";
import {
  ALL_Z_SCORE_CURVES,
  drawGrowthChart,
  type BaseChartOptions,
  getContainerElement,
  calculateScales,
} from "./d3js-chart-utils";

/**
 * Configuration options for the weight-for-length growth chart
 */
export interface WeightForLengthChartOptions extends BaseChartOptions {
  /** X-axis label (default: "Length (cm)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Weight (kg)") */
  yAxisLabel?: string;
}

/**
 * Configuration options for adding a data point to the chart
 */
export interface WeightForLengthPointOptions {
  /** Color for the point (default: "#000000") */
  color?: string;
  /** Radius for the point in pixels (default: 5) */
  radius?: number;
  /** Stroke color for the point outline (default: "#fff") */
  strokeColor?: string;
  /** Stroke width for the point outline (default: 2) */
  strokeWidth?: number;
  /** Opacity of the point (default: 0.9) */
  opacity?: number;
  /** Text to display in the tooltip (default: "You are here") */
  tooltipText?: string;
}

/**
 * Configuration options for adding a data point to an existing weight-for-length chart
 */
export interface WeightForLengthPointConfig {
  /** Array of WeightForLength objects (same data used to create the chart) */
  data: WeightForLength[];
  /** Configuration options (same options used to create the chart, includes container) */
  chartOptions: WeightForLengthChartOptions;
  /** Length measurement in cm (X-axis value) */
  length: number;
  /** Weight measurement in kg (Y-axis value) */
  weight: number;
  /** Optional styling options for the point */
  pointOptions?: WeightForLengthPointOptions;
}

/**
 * Default configuration values
 */
const DEFAULT_OPTIONS: Required<Omit<WeightForLengthChartOptions, "container">> = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
  xAxisLabel: "Length (cm)",
  yAxisLabel: "Weight (kg)",
  margins: { top: 60, right: 80, bottom: 60, left: 80 },
  showGrid: true,
  showLegend: true,
  colors: {
    sd3neg: "#d73027", // Red for -3SD
    sd2neg: "#fc8d59", // Orange for -2SD
    sd1neg: "#fee08b", // Yellow for -1SD
    sd0: "#3288bd", // Blue for median (0SD)
    sd1: "#fee08b", // Yellow for +1SD
    sd2: "#fc8d59", // Orange for +2SD
    sd3: "#d73027", // Red for +3SD
  },
};

/**
 * Calculates weight from z-score using the WHO LMS (Lambda-Mu-Sigma) method
 * 
 * The LMS method is used by WHO to transform growth measurements into z-scores
 * that account for the non-normal distribution of growth data. This function
 * performs the reverse calculation: given a z-score, it calculates the
 * corresponding weight measurement.
 * 
 * Formula:
 * - If L != 0: X = M * (1 + L * S * Z)^(1/L)
 * - If L == 0: X = M * exp(S * Z)
 * 
 * Where:
 * - X = weight measurement (kg)
 * - M = median (Mu) parameter
 * - L = lambda parameter (Box-Cox transformation)
 * - S = sigma parameter (coefficient of variation)
 * - Z = z-score
 * 
 * @param l - Lambda parameter (Box-Cox power transformation)
 * @param m - Mu parameter (median value)
 * @param s - Sigma parameter (coefficient of variation)
 * @param zScore - Z-score value (-3 to +3)
 * @returns Weight in kg calculated using LMS method
 */
export function calculateWeightFromLMS(
  l: number,
  m: number,
  s: number,
  zScore: number
): number {
  // Handle the case when L (lambda) is 0 or very close to 0
  // Use logarithmic transformation: X = M * exp(S * Z)
  if (Math.abs(l) < 1e-10) {
    return m * Math.exp(s * zScore);
  }

  // Standard LMS formula: X = M * (1 + L * S * Z)^(1/L)
  const innerValue = 1 + l * s * zScore;
  
  // Check for invalid values (negative base with fractional exponent)
  if (innerValue <= 0) {
    // Return NaN for invalid calculations
    return NaN;
  }

  // Calculate weight using LMS formula
  return m * Math.pow(innerValue, 1 / l);
}

/**
 * Creates a D3.js visualization of WHO weight-for-length growth chart
 * 
 * This function generates a growth chart following WHO standards, displaying
 * multiple z-score curves (standard deviation lines) that show the distribution
 * of weight-for-length measurements across different percentiles.
 * 
 * The chart uses:
 * - X-axis: length field (length in cm)
 * - Y-axis: pre-calculated weight values from sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3 fields
 * 
 * @param data - Array of WeightForLength objects containing:
 *               - length: length measurement (cm) - used for X-axis
 *               - sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3: pre-calculated weight values (kg) - used for Y-axis
 * @param options - Configuration options for customizing the chart appearance
 * 
 * @example
 * ```typescript
 * import { WeightForLengthGirlBirthTo2Years } from "./weight-for-length-birth-to-2-years";
 * 
 * d3js_weight_for_length(WeightForLengthGirlBirthTo2Years, {
 *   container: "#chart-container",
 *   title: "Weight-for-length",
 *   subtitle: "Girls, Birth to 2 years",
 *   width: 900,
 *   height: 700
 * });
 * ```
 */
export function d3js_weight_for_length(
  data: WeightForLength[],
  options: WeightForLengthChartOptions
): void {
  // Merge user options with defaults
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
    margins: { ...DEFAULT_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_OPTIONS.colors, ...options.colors },
  };

  // Use all z-score curves for weight-for-length chart
  drawGrowthChart({
    data,
    getXValue: (d) => d.length,
    getYValue: (d, curveKey) => d[curveKey] as number,
    options: config,
    curves: ALL_Z_SCORE_CURVES,
  });
}

/**
 * Default point styling options
 */
const DEFAULT_POINT_OPTIONS: Required<WeightForLengthPointOptions> = {
  color: "#000000",
  radius: 5,
  strokeColor: "#fff",
  strokeWidth: 2,
  opacity: 0.9,
  tooltipText: "You are here",
};

/**
 * Adds a data point to an existing weight-for-length chart
 * 
 * This function draws a point (circle) on a chart that was previously created
 * by d3js_weight_for_length. The point represents a specific weight-for-length
 * measurement.
 * 
 * @param options - Configuration object containing data, chart options (with container), length, weight, and optional point styling
 * 
 * @example
 * ```typescript
 * // First create the chart
 * d3js_weight_for_length(data, { container: "#chart-container" });
 * 
 * // Then add a point with default styling
 * d3js_weight_length_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   length: 65,  // length in cm
 *   weight: 7.5  // weight in kg
 * });
 * 
 * // Or with custom styling
 * d3js_weight_length_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   length: 65,
 *   weight: 7.5,
 *   pointOptions: { color: "#ff0000", radius: 8 }
 * });
 * ```
 */
/**
 * Helper function to get chart elements (SVG and main group)
 */
function getChartElements(containerElement: HTMLElement) {
  const svg = d3.select(containerElement).select<SVGSVGElement>("svg");
  if (svg.empty()) {
    throw new Error("No existing chart found. Please create a chart using d3js_weight_for_length first.");
  }

  const g = svg.select<SVGGElement>("g");
  if (g.empty()) {
    throw new Error("Chart structure not found. Please ensure the chart was created correctly.");
  }

  return { svg, g };
}

/**
 * Helper function to calculate scales from data
 */
function calculateScalesForWeightForLength(
  data: WeightForLength[],
  innerWidth: number,
  innerHeight: number
) {
  return calculateScales(
    data,
    (d) => d.length,
    (d, curveKey) => d[curveKey] as number,
    ALL_Z_SCORE_CURVES,
    innerWidth,
    innerHeight,
    0.05, // yPadding
    20 // defaultYMax
  );
}

/**
 * Helper function to draw the data point circle
 */
function drawDataPoint(
  g: d3.Selection<any, unknown, null, undefined>,
  x: number,
  y: number,
  pointConfig: Required<WeightForLengthPointOptions>
) {
  g.selectAll(".weight-length-data-point").remove();

  g.append("circle")
    .attr("class", "weight-length-data-point")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", pointConfig.radius)
    .attr("fill", pointConfig.color)
    .attr("stroke", pointConfig.strokeColor)
    .attr("stroke-width", pointConfig.strokeWidth)
    .attr("opacity", pointConfig.opacity);
}

/**
 * Helper function to calculate tooltip position inside the chart area, close to the circle
 */
function calculateTooltipPosition(
  circleX: number,
  circleY: number,
  circleRadius: number,
  innerWidth: number,
  innerHeight: number
) {
  const tooltipPadding = 12;
  const tooltipWidth = 100;
  const tooltipHeight = 40;
  const arrowSize = 8;
  const distanceFromCircle = circleRadius + tooltipPadding;

  // Try to position tooltip above the circle first
  let tooltipX = circleX - tooltipWidth / 2;
  let tooltipY = circleY - tooltipHeight - distanceFromCircle;
  let arrowSide: "left" | "right" | "top" | "bottom" = "bottom";

  // If tooltip would go off the top, try below the circle
  if (tooltipY < 0) {
    tooltipY = circleY + distanceFromCircle;
    arrowSide = "top";
  }

  // If tooltip would go off the left edge, adjust to the right
  if (tooltipX < 0) {
    tooltipX = circleX + distanceFromCircle;
    arrowSide = "left";
    // If that doesn't work, try left side of circle
    if (tooltipX + tooltipWidth > innerWidth) {
      tooltipX = circleX - tooltipWidth - distanceFromCircle;
      arrowSide = "right";
    }
  }

  // If tooltip would go off the right edge, adjust to the left
  if (tooltipX + tooltipWidth > innerWidth) {
    tooltipX = circleX - tooltipWidth - distanceFromCircle;
    arrowSide = "right";
    // If that doesn't work, try right side of circle
    if (tooltipX < 0) {
      tooltipX = circleX + distanceFromCircle;
      arrowSide = "left";
    }
  }

  // If tooltip would go off the bottom, adjust upward
  if (tooltipY + tooltipHeight > innerHeight) {
    tooltipY = circleY - tooltipHeight - distanceFromCircle;
    arrowSide = "bottom";
  }

  // Final bounds check - keep tooltip within chart area
  if (tooltipX < 0) tooltipX = 5;
  if (tooltipX + tooltipWidth > innerWidth) tooltipX = innerWidth - tooltipWidth - 5;
  if (tooltipY < 0) tooltipY = 5;
  if (tooltipY + tooltipHeight > innerHeight) tooltipY = innerHeight - tooltipHeight - 5;

  return {
    tooltipX,
    tooltipY,
    tooltipWidth,
    tooltipHeight,
    arrowSize,
    arrowSide,
    circleX,
    circleY,
  };
}

/**
 * Helper function to create arrow path pointing from tooltip to the circle
 */
function createArrowPath(
  arrowSide: "left" | "right" | "top" | "bottom",
  tooltipX: number,
  tooltipY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  circleX: number,
  circleY: number,
  arrowSize: number
): string {
  const tooltipCenterX = tooltipX + tooltipWidth / 2;
  const tooltipCenterY = tooltipY + tooltipHeight / 2;

  // Calculate arrow start position on the tooltip edge closest to circle
  let arrowStartX: number;
  let arrowStartY: number;
  let angle: number;

  if (arrowSide === "left") {
    arrowStartX = tooltipX;
    arrowStartY = tooltipCenterY;
    angle = Math.atan2(circleY - arrowStartY, circleX - arrowStartX);
  } else if (arrowSide === "right") {
    arrowStartX = tooltipX + tooltipWidth;
    arrowStartY = tooltipCenterY;
    angle = Math.atan2(circleY - arrowStartY, circleX - arrowStartX);
  } else if (arrowSide === "top") {
    arrowStartX = tooltipCenterX;
    arrowStartY = tooltipY;
    angle = Math.atan2(circleY - arrowStartY, circleX - arrowStartX);
  } else {
    // bottom
    arrowStartX = tooltipCenterX;
    arrowStartY = tooltipY + tooltipHeight;
    angle = Math.atan2(circleY - arrowStartY, circleX - arrowStartX);
  }

  // Create arrow triangle pointing toward circle
  const arrowPoint1X = arrowStartX + arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = arrowStartY + arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = arrowStartX + arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = arrowStartY + arrowSize * Math.sin(angle + Math.PI / 6);

  return `M ${arrowStartX} ${arrowStartY} L ${arrowPoint1X} ${arrowPoint1Y} L ${arrowPoint2X} ${arrowPoint2Y} Z`;
}

/**
 * Helper function to draw the tooltip inside the chart area
 */
function drawTooltip(
  g: d3.Selection<any, unknown, null, undefined>,
  tooltipX: number,
  tooltipY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  arrowPath: string,
  tooltipText: string
) {
  g.selectAll(".weight-length-tooltip").remove();

  const tooltipGroup = g.append("g").attr("class", "weight-length-tooltip");

  // Draw arrow
  tooltipGroup
    .append("path")
    .attr("d", arrowPath)
    .attr("fill", "#333")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("opacity", 1)
    .attr("pointer-events", "none");

  // Draw tooltip background
  tooltipGroup
    .append("rect")
    .attr("x", tooltipX)
    .attr("y", tooltipY)
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)
    .attr("rx", 8)
    .attr("ry", 8)
    .attr("fill", "#333")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .attr("opacity", 1)
    .attr("pointer-events", "none");

  // Add text
  tooltipGroup
    .append("text")
    .attr("x", tooltipX + tooltipWidth / 2)
    .attr("y", tooltipY + tooltipHeight / 2 + 4)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .attr("font-family", "system-ui, -apple-system, Arial, sans-serif")
    .attr("pointer-events", "none")
    .text(tooltipText);
}

/**
 * Adds a data point to an existing weight-for-length chart
 */
export function d3js_weight_length_point(
  options: WeightForLengthPointConfig
): void {
  const {
    data,
    chartOptions,
    length,
    weight,
    pointOptions,
  } = options;

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Merge chart options with defaults
  const config = {
    ...DEFAULT_OPTIONS,
    ...chartOptions,
    margins: { ...DEFAULT_OPTIONS.margins, ...chartOptions.margins },
  };

  // Merge point options with defaults
  const pointConfig = {
    ...DEFAULT_POINT_OPTIONS,
    ...pointOptions,
  };

  // Get container element
  const containerElement = getContainerElement(config.container);

  // Get chart elements
  const { svg, g } = getChartElements(containerElement);

  // Calculate dimensions
  const innerWidth = config.width - config.margins.left - config.margins.right;
  const innerHeight = config.height - config.margins.top - config.margins.bottom;

  // Calculate scales
  const { xScale, yScale } = calculateScalesForWeightForLength(data, innerWidth, innerHeight);

  // Calculate circle position in inner chart coordinates
  const circleX = xScale(length);
  const circleY = yScale(weight);

  // Validate point is within reasonable bounds
  if (circleX < -innerWidth * 0.1 || circleX > innerWidth * 1.1 || 
      circleY < -innerHeight * 0.1 || circleY > innerHeight * 1.1) {
    console.warn(
      `Point (${length} cm, ${weight} kg) is far outside the chart bounds.`
    );
  }

  // Draw the data point circle
  drawDataPoint(g, circleX, circleY, pointConfig);

  // Calculate tooltip position (inside chart area, close to circle)
  const tooltipPos = calculateTooltipPosition(
    circleX,
    circleY,
    pointConfig.radius,
    innerWidth,
    innerHeight
  );

  // Create arrow path pointing from tooltip to circle
  const arrowPath = createArrowPath(
    tooltipPos.arrowSide,
    tooltipPos.tooltipX,
    tooltipPos.tooltipY,
    tooltipPos.tooltipWidth,
    tooltipPos.tooltipHeight,
    tooltipPos.circleX,
    tooltipPos.circleY,
    tooltipPos.arrowSize
  );

  // Draw the tooltip inside the chart area
  drawTooltip(
    g,
    tooltipPos.tooltipX,
    tooltipPos.tooltipY,
    tooltipPos.tooltipWidth,
    tooltipPos.tooltipHeight,
    arrowPath,
    pointConfig.tooltipText
  );
}