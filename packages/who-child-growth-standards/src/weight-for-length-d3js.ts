import type { WeightForLength } from "./types";
import {
  ALL_Z_SCORE_CURVES,
  drawGrowthChart,
  type BaseChartOptions,
} from "./d3js-chart-utils";
import { d3js_growth_chart_point } from "./growth-chart-point-d3js";

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

  // Use the generic function
  d3js_growth_chart_point({
    data,
    chartOptions: config,
    xValue: length,
    yValue: weight,
    getXValue: (d) => d.length,
    getYValue: (d, curveKey) => d[curveKey] as number,
    curves: ALL_Z_SCORE_CURVES,
    pointOptions: pointConfig,
    yPadding: 0.05,
    defaultYMax: 20,
  });
}