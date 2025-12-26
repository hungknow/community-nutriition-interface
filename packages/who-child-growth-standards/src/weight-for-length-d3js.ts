import type { WeightForLength } from "./types";
import * as d3 from "d3";

/**
 * Configuration options for the weight-for-length growth chart
 */
export interface WeightForLengthChartOptions {
  /** DOM element or selector string where the chart will be rendered */
  container: string | HTMLElement;
  /** Width of the chart in pixels (default: 800) */
  width?: number;
  /** Height of the chart in pixels (default: 600) */
  height?: number;
  /** Chart title (default: "Weight-for-length") */
  title?: string;
  /** Subtitle (e.g., "Girls, Birth to 2 years") */
  subtitle?: string;
  /** X-axis label (default: "Length (cm)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Weight (kg)") */
  yAxisLabel?: string;
  /** Margins around the chart {top, right, bottom, left} */
  margins?: { top: number; right: number; bottom: number; left: number };
  /** Whether to show grid lines (default: true) */
  showGrid?: boolean;
  /** Whether to show legend (default: true) */
  showLegend?: boolean;
  /** Custom colors for z-score curves (optional) */
  colors?: {
    sd3neg?: string;
    sd2neg?: string;
    sd1neg?: string;
    sd0?: string;
    sd1?: string;
    sd2?: string;
    sd3?: string;
  };
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
  title: "Weight-for-length",
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
 * Z-score curve definitions for the chart
 * Each curve represents a standard deviation line from the median
 */
const Z_SCORE_CURVES = [
  { key: "sd3neg", label: "-3 SD", zScore: -3 },
  { key: "sd2neg", label: "-2 SD", zScore: -2 },
  { key: "sd1neg", label: "-1 SD", zScore: -1 },
  { key: "sd0", label: "Median", zScore: 0 },
  { key: "sd1", label: "+1 SD", zScore: 1 },
  { key: "sd2", label: "+2 SD", zScore: 2 },
  { key: "sd3", label: "+3 SD", zScore: 3 },
] as const;

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

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Get or create container element
  let containerElement: HTMLElement;
  if (typeof config.container === "string") {
    const element = d3.select(config.container).node() as HTMLElement;
    if (!element) {
      throw new Error(`Container element "${config.container}" not found`);
    }
    containerElement = element;
  } else {
    containerElement = config.container;
  }

  // Clear any existing content in the container
  d3.select(containerElement).selectAll("*").remove();

  // Calculate inner dimensions (excluding margins)
  const innerWidth = config.width - config.margins.left - config.margins.right;
  const innerHeight = config.height - config.margins.top - config.margins.bottom;

  // Create SVG element
  const svg = d3
    .select(containerElement)
    .append("svg")
    .attr("width", config.width)
    .attr("height", config.height)
    .attr("viewBox", `0 0 ${config.width} ${config.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Create main group for chart content (with margins applied via transform)
  const g = svg
    .append("g")
    .attr("transform", `translate(${config.margins.left},${config.margins.top})`);

  // Calculate domain ranges from data
  // X-axis: length values (cm)
  const lengthValues = data.map((d) => d.length);
  const xMin = d3.min(lengthValues) ?? 0;
  const xMax = d3.max(lengthValues) ?? 100;

  // Y-axis: weight values (kg) - find min/max across all z-score curves
  // Use the pre-calculated sd3neg through sd3 values from the data
  const allWeightValues: number[] = [];
  Z_SCORE_CURVES.forEach((curve) => {
    data.forEach((d) => {
      // Use pre-calculated weight values from the data
      const weight = d[curve.key as keyof WeightForLength] as number;
      if (typeof weight === "number" && !isNaN(weight)) {
        allWeightValues.push(weight);
      }
    });
  });
  const yMin = (d3.min(allWeightValues) ?? 0) * 0.95; // Add 5% padding
  const yMax = (d3.max(allWeightValues) ?? 20) * 1.05; // Add 5% padding

  // Create scales
  // X-scale: maps length (cm) to pixel positions
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    .nice();

  // Y-scale: maps weight (kg) to pixel positions
  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([innerHeight, 0])
    .nice();

  // Create axis generators
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

  // Add grid lines if enabled
  if (config.showGrid) {
    // Horizontal grid lines (for weight values)
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Vertical grid lines (for length values)
    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");
  }

  // Draw each z-score curve using pre-calculated values from the data
  // X-axis uses length field, Y-axis uses the sd3neg through sd3 fields
  Z_SCORE_CURVES.forEach((curve) => {
    // Extract weight values for this specific z-score curve from the data
    const curveData = data.map((d) => ({
      length: d.length, // X-axis: use length field
      weight: d[curve.key as keyof WeightForLength] as number, // Y-axis: use pre-calculated sd values
    }));

    // Create line generator for this specific curve
    const curveLine = d3
      .line<{ length: number; weight: number }>()
      .x((d: { length: number; weight: number }) => xScale(d.length))
      .y((d: { length: number; weight: number }) => yScale(d.weight))
      .curve(d3.curveMonotoneX);

    // Draw the line path
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", config.colors[curve.key as keyof typeof config.colors] ?? "#000")
      .attr("stroke-width", curve.key === "sd0" ? 2.5 : 1.5) // Thicker line for median
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", curveLine)
      .attr("class", `z-score-line z-score-${curve.key}`);
  });

  // Add X-axis
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", config.margins.bottom - 10)
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(config.xAxisLabel);

  // Add Y-axis
  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -config.margins.left + 20)
    .attr("x", -innerHeight / 2)
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(config.yAxisLabel);

  // Add title
  if (config.title) {
    svg
      .append("text")
      .attr("x", config.width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(config.title);
  }

  // Add subtitle
  if (config.subtitle) {
    svg
      .append("text")
      .attr("x", config.width / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text(config.subtitle);
  }

  // Add legend if enabled
  if (config.showLegend) {
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${config.width - config.margins.right + 10}, ${config.margins.top})`);

    const legendItems = Z_SCORE_CURVES.map((curve, i) => ({
      ...curve,
      y: i * 25,
    }));

    legendItems.forEach((item) => {
      const legendGroup = legend.append("g").attr("transform", `translate(0, ${item.y})`);

      // Legend line
      legendGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", config.colors[item.key as keyof typeof config.colors] ?? "#000")
        .attr("stroke-width", item.key === "sd0" ? 2.5 : 1.5);

      // Legend text
      legendGroup
        .append("text")
        .attr("x", 25)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("fill", "#000")
        .text(item.label);
    });
  }
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
 * Helper function to get and validate container element
 */
function getContainerElement(container: string | HTMLElement): HTMLElement {
  if (typeof container === "string") {
    const element = d3.select(container).node() as HTMLElement;
    if (!element) {
      throw new Error(`Container element "${container}" not found`);
    }
    return element;
  }
  return container;
}

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
function calculateScales(
  data: WeightForLength[],
  innerWidth: number,
  innerHeight: number
) {
  const lengthValues = data.map((d) => d.length);
  const xMin = d3.min(lengthValues) ?? 0;
  const xMax = d3.max(lengthValues) ?? 100;

  const allWeightValues: number[] = [];
  Z_SCORE_CURVES.forEach((curve) => {
    data.forEach((d) => {
      const weightValue = d[curve.key as keyof WeightForLength] as number;
      if (typeof weightValue === "number" && !isNaN(weightValue)) {
        allWeightValues.push(weightValue);
      }
    });
  });
  const yMin = (d3.min(allWeightValues) ?? 0) * 0.95;
  const yMax = (d3.max(allWeightValues) ?? 20) * 1.05;

  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([0, innerWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([innerHeight, 0])
    .nice();

  return { xScale, yScale };
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
  const { xScale, yScale } = calculateScales(data, innerWidth, innerHeight);

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