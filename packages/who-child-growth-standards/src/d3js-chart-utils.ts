import * as d3 from "d3";

/**
 * Z-score curve definition
 */
export interface ZScoreCurve {
  key: "sd3neg" | "sd2neg" | "sd1neg" | "sd0" | "sd1" | "sd2" | "sd3";
  label: string;
  zScore: number;
}

/**
 * All available z-score curves
 */
export const ALL_Z_SCORE_CURVES: readonly ZScoreCurve[] = [
  { key: "sd3neg", label: "-3 SD", zScore: -3 },
  { key: "sd2neg", label: "-2 SD", zScore: -2 },
  { key: "sd1neg", label: "-1 SD", zScore: -1 },
  { key: "sd0", label: "Median", zScore: 0 },
  { key: "sd1", label: "+1 SD", zScore: 1 },
  { key: "sd2", label: "+2 SD", zScore: 2 },
  { key: "sd3", label: "+3 SD", zScore: 3 },
] as const;

/**
 * Base chart options that can be extended
 */
export interface BaseChartOptions {
  /** DOM element or selector string where the chart will be rendered */
  container: string | HTMLElement;
  /** Width of the chart in pixels (default: 800) */
  width?: number;
  /** Height of the chart in pixels (default: 600) */
  height?: number;
  /** Chart title (default: "") */
  title?: string;
  /** Subtitle (e.g., "Girls, Birth to 2 years") */
  subtitle?: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
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
 * Default chart configuration values
 */
export const DEFAULT_CHART_OPTIONS = {
  width: 800,
  height: 600,
  title: "",
  subtitle: "",
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
} as const;

/**
 * Data point for a z-score curve
 */
export interface CurveDataPoint {
  x: number;
  y: number;
}

/**
 * Generic data type that has z-score fields
 */
export type DataWithZScores = {
  [K in ZScoreCurve["key"]]?: number;
} & {
  [key: string]: any;
};

/**
 * Configuration for drawing a growth chart
 */
export interface ChartDrawingConfig<T extends DataWithZScores> {
  /** Data array */
  data: T[];
  /** X-axis value extractor function */
  getXValue: (d: T) => number;
  /** Y-axis value extractor function for a specific z-score curve */
  getYValue: (d: T, curveKey: ZScoreCurve["key"]) => number;
  /** Chart options */
  options: BaseChartOptions;
  /** Z-score curves to draw (filtered list) */
  curves: readonly ZScoreCurve[];
}

/**
 * Helper function to get and validate container element
 */
export function getContainerElement(container: string | HTMLElement): HTMLElement {
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
 * Helper function to calculate scales from data
 */
export function calculateScales<T extends DataWithZScores>(
  data: T[],
  getXValue: (d: T) => number,
  getYValue: (d: T, curveKey: ZScoreCurve["key"]) => number,
  curves: readonly ZScoreCurve[],
  innerWidth: number,
  innerHeight: number,
  yPadding: number = 0.05,
  defaultYMax: number = 100
) {
  const xValues = data.map(getXValue);
  const xMin = d3.min(xValues) ?? 0;
  const xMax = d3.max(xValues) ?? 100;

  const allYValues: number[] = [];
  curves.forEach((curve) => {
    data.forEach((d) => {
      const yValue = getYValue(d, curve.key);
      if (typeof yValue === "number" && !isNaN(yValue)) {
        allYValues.push(yValue);
      }
    });
  });
  const yMin = (d3.min(allYValues) ?? 0) * (1 - yPadding);
  const yMax = (d3.max(allYValues) ?? defaultYMax) * (1 + yPadding);

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
 * Draws grid lines on the chart
 */
export function drawGridLines(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  innerWidth: number,
  innerHeight: number
): void {
  // Horizontal grid lines (for x-axis values)
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

  // Vertical grid lines (for y-axis values)
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

/**
 * Draws z-score curves on the chart
 */
export function drawZScoreCurves<T extends DataWithZScores>(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: ChartDrawingConfig<T>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>
): void {
  config.curves.forEach((curve) => {
    // Extract data points for this specific z-score curve
    const curveData: CurveDataPoint[] = config.data.map((d) => ({
      x: config.getXValue(d),
      y: config.getYValue(d, curve.key),
    }));

    // Create line generator for this specific curve
    const curveLine = d3
      .line<CurveDataPoint>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Get color for this curve
    const color = config.options.colors?.[curve.key] ?? DEFAULT_CHART_OPTIONS.colors[curve.key];

    // Draw the line path
    g.append("path")
      .datum(curveData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", curve.key === "sd0" ? 2.5 : 1.5) // Thicker line for median
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", curveLine)
      .attr("class", `z-score-line z-score-${curve.key}`);
  });
}

/**
 * Draws axes on the chart
 */
export function drawAxes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  innerWidth: number,
  innerHeight: number,
  xAxisLabel: string,
  yAxisLabel: string,
  margins: { top: number; right: number; bottom: number; left: number }
): void {
  // Create axis generators
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);

  // Add X-axis
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", margins.bottom - 10)
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(xAxisLabel);

  // Add Y-axis
  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margins.left + 20)
    .attr("x", -innerHeight / 2)
    .attr("fill", "#000")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(yAxisLabel);
}

/**
 * Draws title and subtitle on the chart
 */
export function drawTitleAndSubtitle(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  title?: string,
  subtitle?: string
): void {
  // Add title
  if (title) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text(title);
  }

  // Add subtitle
  if (subtitle) {
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text(subtitle);
  }
}

/**
 * Draws legend on the chart
 */
export function drawLegend(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  curves: readonly ZScoreCurve[],
  colors: BaseChartOptions["colors"],
  width: number,
  margins: { top: number; right: number; bottom: number; left: number }
): void {
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margins.right + 10}, ${margins.top})`);

  const legendItems = curves.map((curve, i) => ({
    ...curve,
    y: i * 25,
  }));

  legendItems.forEach((item) => {
    const legendGroup = legend.append("g").attr("transform", `translate(0, ${item.y})`);

    // Legend line
    const color = colors?.[item.key] ?? DEFAULT_CHART_OPTIONS.colors[item.key];
    legendGroup
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", color)
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

/**
 * Main function to draw a growth chart
 * This is the core reusable function that can be used by all chart types
 */
export function drawGrowthChart<T extends DataWithZScores>(
  config: ChartDrawingConfig<T>
): void {
  const { data, options, curves } = config;

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Merge user options with defaults
  const chartConfig = {
    ...DEFAULT_CHART_OPTIONS,
    ...options,
    margins: { ...DEFAULT_CHART_OPTIONS.margins, ...options.margins },
    colors: { ...DEFAULT_CHART_OPTIONS.colors, ...options.colors },
  };

  // Get or create container element
  const containerElement = getContainerElement(chartConfig.container);

  // Clear any existing content in the container
  d3.select(containerElement).selectAll("*").remove();

  // Calculate inner dimensions (excluding margins)
  const innerWidth = chartConfig.width - chartConfig.margins.left - chartConfig.margins.right;
  const innerHeight = chartConfig.height - chartConfig.margins.top - chartConfig.margins.bottom;

  // Create SVG element
  const svg = d3
    .select(containerElement)
    .append("svg")
    .attr("width", chartConfig.width)
    .attr("height", chartConfig.height)
    .attr("viewBox", `0 0 ${chartConfig.width} ${chartConfig.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Create main group for chart content (with margins applied via transform)
  const g = svg
    .append("g")
    .attr("transform", `translate(${chartConfig.margins.left},${chartConfig.margins.top})`);

  // Calculate scales
  const { xScale, yScale } = calculateScales(
    data,
    config.getXValue,
    config.getYValue,
    curves,
    innerWidth,
    innerHeight
  );

  // Add grid lines if enabled
  if (chartConfig.showGrid) {
    drawGridLines(g, xScale, yScale, innerWidth, innerHeight);
  }

  // Draw z-score curves
  drawZScoreCurves(g, config, xScale, yScale);

  // Draw axes
  drawAxes(
    g,
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    chartConfig.xAxisLabel ?? "",
    chartConfig.yAxisLabel ?? "",
    chartConfig.margins
  );

  // Draw title and subtitle
  drawTitleAndSubtitle(svg, chartConfig.width, chartConfig.title, chartConfig.subtitle);

  // Add legend if enabled
  if (chartConfig.showLegend) {
    drawLegend(svg, curves, chartConfig.colors, chartConfig.width, chartConfig.margins);
  }
}

