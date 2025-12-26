import type { WeightForAgeByWeek, WeightForAgeByMonth } from "../types";
import {
  ALL_Z_SCORE_CURVES,
  drawGrowthChart,
  type BaseChartOptions,
} from "./d3js-chart-utils";
import { d3js_growth_chart_point } from "./growth-chart-point-d3js";

/**
 * Configuration options for the weight-for-age growth chart (by week)
 */
export interface WeightForAgeByWeekChartOptions extends BaseChartOptions {
  /** X-axis label (default: "Age (weeks)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Weight (kg)") */
  yAxisLabel?: string;
}

/**
 * Configuration options for the weight-for-age growth chart (by month)
 */
export interface WeightForAgeByMonthChartOptions extends BaseChartOptions {
  /** X-axis label (default: "Age (months)") */
  xAxisLabel?: string;
  /** Y-axis label (default: "Weight (kg)") */
  yAxisLabel?: string;
}

/**
 * Configuration options for adding a data point to the chart (by week)
 */
export interface WeightForAgeByWeekPointOptions {
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
 * Configuration options for adding a data point to the chart (by month)
 */
export interface WeightForAgeByMonthPointOptions {
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
 * Configuration options for adding a data point to an existing weight-for-age chart (by week)
 */
export interface WeightForAgeByWeekPointConfig {
  /** Array of WeightForAgeByWeek objects (same data used to create the chart) */
  data: WeightForAgeByWeek[];
  /** Configuration options (same options used to create the chart, includes container) */
  chartOptions: WeightForAgeByWeekChartOptions;
  /** Age in weeks (X-axis value) */
  week: number;
  /** Weight measurement in kg (Y-axis value) */
  weight: number;
  /** Optional styling options for the point */
  pointOptions?: WeightForAgeByWeekPointOptions;
}

/**
 * Configuration options for adding a data point to an existing weight-for-age chart (by month)
 */
export interface WeightForAgeByMonthPointConfig {
  /** Array of WeightForAgeByMonth objects (same data used to create the chart) */
  data: WeightForAgeByMonth[];
  /** Configuration options (same options used to create the chart, includes container) */
  chartOptions: WeightForAgeByMonthChartOptions;
  /** Age in months (X-axis value) */
  month: number;
  /** Weight measurement in kg (Y-axis value) */
  weight: number;
  /** Optional styling options for the point */
  pointOptions?: WeightForAgeByMonthPointOptions;
}

/**
 * Default configuration values for weight-for-age by week chart
 */
const DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS: Required<Omit<WeightForAgeByWeekChartOptions, "container">> = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
  xAxisLabel: "Age (weeks)",
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
 * Default configuration values for weight-for-age by month chart
 */
const DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS: Required<Omit<WeightForAgeByMonthChartOptions, "container">> = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
  xAxisLabel: "Age (months)",
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
 * Default point styling options
 */
const DEFAULT_POINT_OPTIONS: Required<WeightForAgeByWeekPointOptions> = {
  color: "#000000",
  radius: 5,
  strokeColor: "#fff",
  strokeWidth: 2,
  opacity: 0.9,
  tooltipText: "You are here",
};

/**
 * Creates a D3.js visualization of WHO weight-for-age growth chart (by week)
 * 
 * This function generates a growth chart following WHO standards, displaying
 * multiple z-score curves (standard deviation lines) that show the distribution
 * of weight-for-age measurements across different percentiles.
 * 
 * The chart uses:
 * - X-axis: week field (age in weeks)
 * - Y-axis: pre-calculated weight values from sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3 fields
 * 
 * @param data - Array of WeightForAgeByWeek objects containing:
 *               - week: age in weeks - used for X-axis
 *               - sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3: pre-calculated weight values (kg) - used for Y-axis
 * @param options - Configuration options for customizing the chart appearance
 * 
 * @example
 * ```typescript
 * import { weightForAgeGirl0To13Weeks } from "./weight-for-age-0-to-13-weeks";
 * 
 * d3js_weight_for_age_by_week(weightForAgeGirl0To13Weeks, {
 *   container: "#chart-container",
 *   title: "Weight-for-age",
 *   subtitle: "Girls, Birth to 13 weeks",
 *   width: 900,
 *   height: 700
 * });
 * ```
 */
export function d3js_weight_for_age_by_week(
  data: WeightForAgeByWeek[],
  options: WeightForAgeByWeekChartOptions
): void {
  // Merge user options with defaults
  const config = {
    ...DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS,
    ...options,
    margins: { ...DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS.colors, ...options.colors },
  };

  // Use all z-score curves for weight-for-age chart
  drawGrowthChart({
    data,
    getXValue: (d) => d.week,
    getYValue: (d, curveKey) => d[curveKey] as number,
    options: config,
    curves: ALL_Z_SCORE_CURVES,
  });
}

/**
 * Creates a D3.js visualization of WHO weight-for-age growth chart (by month)
 * 
 * This function generates a growth chart following WHO standards, displaying
 * multiple z-score curves (standard deviation lines) that show the distribution
 * of weight-for-age measurements across different percentiles.
 * 
 * The chart uses:
 * - X-axis: month field (age in months)
 * - Y-axis: pre-calculated weight values from sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3 fields
 * 
 * @param data - Array of WeightForAgeByMonth objects containing:
 *               - month: age in months - used for X-axis
 *               - sd3neg, sd2neg, sd1neg, sd0, sd1, sd2, sd3: pre-calculated weight values (kg) - used for Y-axis
 * @param options - Configuration options for customizing the chart appearance
 * 
 * @example
 * ```typescript
 * import { weightForAgeGirl0To5Years } from "./weight-for-age-0-to-5-years";
 * 
 * d3js_weight_for_age_by_month(weightForAgeGirl0To5Years, {
 *   container: "#chart-container",
 *   title: "Weight-for-age",
 *   subtitle: "Girls, Birth to 5 years",
 *   width: 900,
 *   height: 700
 * });
 * ```
 */
export function d3js_weight_for_age_by_month(
  data: WeightForAgeByMonth[],
  options: WeightForAgeByMonthChartOptions
): void {
  // Merge user options with defaults
  const config = {
    ...DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS,
    ...options,
    margins: { ...DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS.colors, ...options.colors },
  };

  // Use all z-score curves for weight-for-age chart
  drawGrowthChart({
    data,
    getXValue: (d) => d.month,
    getYValue: (d, curveKey) => d[curveKey] as number,
    options: config,
    curves: ALL_Z_SCORE_CURVES,
  });
}

/**
 * Adds a data point to an existing weight-for-age chart (by week)
 * 
 * This function draws a point (circle) on a chart that was previously created
 * by d3js_weight_for_age_by_week. The point represents a specific weight-for-age
 * measurement.
 * 
 * @param options - Configuration object containing data, chart options (with container), week, weight, and optional point styling
 * 
 * @example
 * ```typescript
 * // First create the chart
 * d3js_weight_for_age_by_week(data, { container: "#chart-container" });
 * 
 * // Then add a point with default styling
 * d3js_weight_for_age_by_week_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   week: 8,  // age in weeks
 *   weight: 5.2  // weight in kg
 * });
 * 
 * // Or with custom styling
 * d3js_weight_for_age_by_week_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   week: 8,
 *   weight: 5.2,
 *   pointOptions: { color: "#ff0000", radius: 8 }
 * });
 * ```
 */
export function d3js_weight_for_age_by_week_point(
  options: WeightForAgeByWeekPointConfig
): void {
  const {
    data,
    chartOptions,
    week,
    weight,
    pointOptions,
  } = options;

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Merge chart options with defaults
  const config = {
    ...DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS,
    ...chartOptions,
    margins: { ...DEFAULT_WEIGHT_FOR_AGE_BY_WEEK_OPTIONS.margins, ...chartOptions.margins },
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
    xValue: week,
    yValue: weight,
    getXValue: (d) => d.week,
    getYValue: (d, curveKey) => d[curveKey] as number,
    curves: ALL_Z_SCORE_CURVES,
    pointOptions: pointConfig,
    yPadding: 0.05,
    defaultYMax: 20,
  });
}

/**
 * Adds a data point to an existing weight-for-age chart (by month)
 * 
 * This function draws a point (circle) on a chart that was previously created
 * by d3js_weight_for_age_by_month. The point represents a specific weight-for-age
 * measurement.
 * 
 * @param options - Configuration object containing data, chart options (with container), month, weight, and optional point styling
 * 
 * @example
 * ```typescript
 * // First create the chart
 * d3js_weight_for_age_by_month(data, { container: "#chart-container" });
 * 
 * // Then add a point with default styling
 * d3js_weight_for_age_by_month_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   month: 12,  // age in months
 *   weight: 9.5  // weight in kg
 * });
 * 
 * // Or with custom styling
 * d3js_weight_for_age_by_month_point({
 *   data: data,
 *   chartOptions: { container: "#chart-container" },
 *   month: 12,
 *   weight: 9.5,
 *   pointOptions: { color: "#ff0000", radius: 8 }
 * });
 * ```
 */
export function d3js_weight_for_age_by_month_point(
  options: WeightForAgeByMonthPointConfig
): void {
  const {
    data,
    chartOptions,
    month,
    weight,
    pointOptions,
  } = options;

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Merge chart options with defaults
  const config = {
    ...DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS,
    ...chartOptions,
    margins: { ...DEFAULT_WEIGHT_FOR_AGE_BY_MONTH_OPTIONS.margins, ...chartOptions.margins },
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
    xValue: month,
    yValue: weight,
    getXValue: (d) => d.month,
    getYValue: (d, curveKey) => d[curveKey] as number,
    curves: ALL_Z_SCORE_CURVES,
    pointOptions: pointConfig,
    yPadding: 0.05,
    defaultYMax: 20,
  });
}

