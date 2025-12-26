import { HeightForAge, LengthForAge } from "./types";
import {
  ALL_Z_SCORE_CURVES,
  drawGrowthChart,
  type BaseChartOptions,
  type ZScoreCurve,
} from "./d3js-chart-utils";

/**
 * Configuration options for the height-for-age growth chart
 */
export interface HeighthForAgeChartOptions extends BaseChartOptions {
  /** X-axis label (default: "Age (months)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Height (cm)") */
  yAxisLabel?: string;
}

/**
 * Configuration options for the length-for-age growth chart
 */
export interface LengthForAgeChartOptions extends BaseChartOptions {
  /** X-axis label (default: "Age (weeks)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Length (cm)") */
  yAxisLabel?: string;
}

/**
 * Default configuration values for height-for-age chart
 */
const DEFAULT_HEIGHT_FOR_AGE_OPTIONS: Required<Omit<HeighthForAgeChartOptions, "container">> = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
  xAxisLabel: "Age (months)",
  yAxisLabel: "Height (cm)",
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
 * Default configuration values for length-for-age chart
 */
const DEFAULT_LENGTH_FOR_AGE_OPTIONS: Required<Omit<LengthForAgeChartOptions, "container">> = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
  xAxisLabel: "Age (weeks)",
  yAxisLabel: "Length (cm)",
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
 * Z-score curves for length/height-for-age charts (excluding -1SD and +1SD)
 */
export const LENGTH_HEIGHT_Z_SCORE_CURVES: readonly ZScoreCurve[] = ALL_Z_SCORE_CURVES.filter(
  (curve) => curve.key !== "sd1neg" && curve.key !== "sd1"
);

/**
 * Creates a D3.js visualization of WHO height-for-age growth chart
 * 
 * This function generates a growth chart following WHO standards, displaying
 * z-score curves (standard deviation lines) that show the distribution
 * of height-for-age measurements across different percentiles.
 * 
 * Note: This chart excludes the -1SD and +1SD curves, showing only:
 * -3SD, -2SD, Median (0SD), +2SD, +3SD
 * 
 * The chart uses:
 * - X-axis: month field (age in months)
 * - Y-axis: pre-calculated height values from sd3neg, sd2neg, sd0, sd2, sd3 fields
 * 
 * @param data - Array of HeightForAge objects containing:
 *               - month: age in months - used for X-axis
 *               - sd3neg, sd2neg, sd0, sd2, sd3: pre-calculated height values (cm) - used for Y-axis
 * @param options - Configuration options for customizing the chart appearance
 * 
 * @example
 * ```typescript
 * import { heightForAgeGirl0To2Years } from "./height-for-age-0-to-2-years";
 * 
 * d3js_height_for_age(heightForAgeGirl0To2Years, {
 *   container: "#chart-container",
 *   title: "Height-for-age",
 *   subtitle: "Girls, Birth to 2 years",
 *   width: 900,
 *   height: 700
 * });
 * ```
 */
export function d3js_height_for_age(
  data: HeightForAge[],
  options: HeighthForAgeChartOptions
): void {
  // Merge user options with defaults
  const config = {
    ...DEFAULT_HEIGHT_FOR_AGE_OPTIONS,
    ...options,
    margins: { ...DEFAULT_HEIGHT_FOR_AGE_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_HEIGHT_FOR_AGE_OPTIONS.colors, ...options.colors },
  };

  // Use filtered z-score curves (excluding -1SD and +1SD)
  drawGrowthChart({
    data,
    getXValue: (d) => d.month,
    getYValue: (d, curveKey) => d[curveKey] as number,
    options: config,
    curves: LENGTH_HEIGHT_Z_SCORE_CURVES,
  });
}

/**
 * Creates a D3.js visualization of WHO length-for-age growth chart
 * 
 * This function generates a growth chart following WHO standards, displaying
 * z-score curves (standard deviation lines) that show the distribution
 * of length-for-age measurements across different percentiles.
 * 
 * Note: This chart excludes the -1SD and +1SD curves, showing only:
 * -3SD, -2SD, Median (0SD), +2SD, +3SD
 * 
 * The chart uses:
 * - X-axis: week field (age in weeks)
 * - Y-axis: pre-calculated length values from sd3neg, sd2neg, sd0, sd2, sd3 fields
 * 
 * @param data - Array of LengthForAge objects containing:
 *               - week: age in weeks - used for X-axis
 *               - sd3neg, sd2neg, sd0, sd2, sd3: pre-calculated length values (cm) - used for Y-axis
 * @param options - Configuration options for customizing the chart appearance
 * 
 * @example
 * ```typescript
 * import { lengthForAgeGirl0To13Weeks } from "./length-for-age-0-to-13-weeks";
 * 
 * d3js_length_for_age(lengthForAgeGirl0To13Weeks, {
 *   container: "#chart-container",
 *   title: "Length-for-age",
 *   subtitle: "Girls, Birth to 13 weeks",
 *   width: 900,
 *   height: 700
 * });
 * ```
 */
export function d3js_length_for_age(
  data: LengthForAge[],
  options: LengthForAgeChartOptions
): void {
  // Merge user options with defaults
  const config = {
    ...DEFAULT_LENGTH_FOR_AGE_OPTIONS,
    ...options,
    margins: { ...DEFAULT_LENGTH_FOR_AGE_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_LENGTH_FOR_AGE_OPTIONS.colors, ...options.colors },
  };

  // Use filtered z-score curves (excluding -1SD and +1SD)
  drawGrowthChart({
    data,
    getXValue: (d) => d.week,
    getYValue: (d, curveKey) => d[curveKey] as number,
    options: config,
    curves: LENGTH_HEIGHT_Z_SCORE_CURVES,
  });
}