import * as d3 from "d3";
import {
  getContainerElement,
  calculateScales,
  type BaseChartOptions,
  type DataWithZScores,
  type ZScoreCurve,
} from "./d3js-chart-utils";

/**
 * Generic point styling options (can be used for any growth chart)
 */
export interface GrowthChartPointOptions {
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
  /** CSS class name for the data point (default: "growth-chart-data-point") */
  pointClass?: string;
  /** CSS class name for the tooltip (default: "growth-chart-tooltip") */
  tooltipClass?: string;
}

/**
 * Generic configuration for adding a data point to any growth chart
 */
export interface GrowthChartPointConfig<T extends DataWithZScores> {
  /** Array of data objects (same data used to create the chart) */
  data: T[];
  /** Configuration options (same options used to create the chart, includes container) */
  chartOptions: BaseChartOptions;
  /** X-axis value for the point */
  xValue: number;
  /** Y-axis value for the point */
  yValue: number;
  /** Function to extract X value from data */
  getXValue: (d: T) => number;
  /** Function to extract Y value from data for a specific curve */
  getYValue: (d: T, curveKey: ZScoreCurve["key"]) => number;
  /** Z-score curves used in the chart */
  curves: readonly ZScoreCurve[];
  /** Optional styling options for the point */
  pointOptions?: GrowthChartPointOptions;
  /** Y-axis padding for scale calculation (default: 0.05) */
  yPadding?: number;
  /** Default Y max for scale calculation (default: 100) */
  defaultYMax?: number;
}

/**
 * Default generic point styling options
 */
const DEFAULT_GENERIC_POINT_OPTIONS: Required<GrowthChartPointOptions> = {
  color: "#000000",
  radius: 5,
  strokeColor: "#fff",
  strokeWidth: 2,
  opacity: 0.9,
  tooltipText: "You are here",
  pointClass: "growth-chart-data-point",
  tooltipClass: "growth-chart-tooltip",
};

/**
 * Helper function to get chart elements (SVG and main group)
 */
function getChartElements(containerElement: HTMLElement) {
  const svg = d3.select(containerElement).select<SVGSVGElement>("svg");
  if (svg.empty()) {
    throw new Error("No existing chart found. Please create a chart first.");
  }

  const g = svg.select<SVGGElement>("g");
  if (g.empty()) {
    throw new Error("Chart structure not found. Please ensure the chart was created correctly.");
  }

  return { svg, g };
}

/**
 * Generic helper function to draw the data point circle
 */
function drawGenericDataPoint(
  g: d3.Selection<any, unknown, null, undefined>,
  x: number,
  y: number,
  pointConfig: Required<GrowthChartPointOptions>
) {
  g.selectAll(`.${pointConfig.pointClass}`).remove();

  g.append("circle")
    .attr("class", pointConfig.pointClass)
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
 * Generic helper function to draw the tooltip inside the chart area
 */
function drawGenericTooltip(
  g: d3.Selection<any, unknown, null, undefined>,
  tooltipX: number,
  tooltipY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  arrowPath: string,
  tooltipText: string,
  tooltipClass: string
) {
  g.selectAll(`.${tooltipClass}`).remove();

  const tooltipGroup = g.append("g").attr("class", tooltipClass);

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
 * Generic function to add a data point to any growth chart
 * 
 * This function can be used with any growth chart type (weight-for-length,
 * length-for-age, height-for-age, etc.) by providing the appropriate
 * getXValue, getYValue, and curves functions.
 * 
 * @param options - Configuration object containing data, chart options, point coordinates, and styling
 * 
 * @example
 * ```typescript
 * // Add a point to a length-for-age chart
 * d3js_growth_chart_point({
 *   data: lengthForAgeData,
 *   chartOptions: { container: "#chart-container", width: 800, height: 600 },
 *   xValue: 12, // age in weeks
 *   yValue: 60, // length in cm
 *   getXValue: (d) => d.week,
 *   getYValue: (d, curveKey) => d[curveKey] as number,
 *   curves: LENGTH_HEIGHT_Z_SCORE_CURVES,
 * });
 * ```
 */
export function d3js_growth_chart_point<T extends DataWithZScores>(
  options: GrowthChartPointConfig<T>
): void {
  const {
    data,
    chartOptions,
    xValue,
    yValue,
    getXValue,
    getYValue,
    curves,
    pointOptions,
    yPadding = 0.05,
    defaultYMax = 100,
  } = options;

  // Validate input data
  if (!data || data.length === 0) {
    throw new Error("Data array cannot be empty");
  }

  // Get container element
  const containerElement = getContainerElement(chartOptions.container);

  // Get chart elements
  const { g } = getChartElements(containerElement);

  // Calculate dimensions
  const margins = chartOptions.margins || { top: 60, right: 80, bottom: 60, left: 80 };
  const width = chartOptions.width || 800;
  const height = chartOptions.height || 600;
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  // Calculate scales
  const { xScale, yScale } = calculateScales(
    data,
    getXValue,
    getYValue,
    curves,
    innerWidth,
    innerHeight,
    yPadding,
    defaultYMax
  );

  // Calculate circle position in inner chart coordinates
  const circleX = xScale(xValue);
  const circleY = yScale(yValue);

  // Validate point is within reasonable bounds
  if (circleX < -innerWidth * 0.1 || circleX > innerWidth * 1.1 || 
      circleY < -innerHeight * 0.1 || circleY > innerHeight * 1.1) {
    console.warn(
      `Point (${xValue}, ${yValue}) is far outside the chart bounds.`
    );
  }

  // Merge point options with defaults
  const pointConfig = {
    ...DEFAULT_GENERIC_POINT_OPTIONS,
    ...pointOptions,
  };

  // Draw the data point circle
  drawGenericDataPoint(g, circleX, circleY, pointConfig);

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
  drawGenericTooltip(
    g,
    tooltipPos.tooltipX,
    tooltipPos.tooltipY,
    tooltipPos.tooltipWidth,
    tooltipPos.tooltipHeight,
    arrowPath,
    pointConfig.tooltipText,
    pointConfig.tooltipClass
  );
}

