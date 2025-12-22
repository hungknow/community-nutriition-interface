import React, { useEffect, useRef, useMemo } from "react";
import type { WeightForLength, WeightForLengthChartOptions } from "who-child-growth-standards";
import { d3js_weight_for_length, d3js_weight_length_point } from "who-child-growth-standards";

/**
 * Props for the D3JsWeightForLength React component
 * 
 * This component accepts the data array and individual chart option fields
 * (not the full WeightForLengthChartOptions object) so React can properly
 * track changes and prevent unnecessary re-renders.
 */
export interface D3JsWeightForLengthProps {
  /** Array of WeightForLength data points to render */
  data: WeightForLength[];

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

  /** Optional CSS class name for the container div */
  className?: string;
  /** Optional inline styles for the container div */
  style?: React.CSSProperties;
  /** Current length measurement in cm (X-axis value) */
  currentLength?: number;
  /** Current weight measurement in kg (Y-axis value) */
  currentWeight?: number;
}

/**
 * React component for rendering WHO weight-for-length growth charts using D3.js
 * 
 * Logic Flow:
 * 1. Create a ref to hold the container DOM element
 * 2. Memoize the chart options object to prevent unnecessary re-renders
 *    - Only recreates when relevant props actually change
 * 3. When component mounts or data/options change:
 *    a. Get the container element from the ref
 *    b. Call d3js_weight_for_length with the data and options
 *    c. The D3 function handles clearing existing content and rendering the chart
 * 4. React automatically tracks changes to data and individual option props
 *    - This allows React to detect when re-rendering is needed
 * 
 * Usage Example:
 * ```tsx
 * import { WeightForLengthGirlBirthTo2Years } from "who-child-growth-standards/weight-for-length-0-to-2-years";
 * 
 * <D3JsWeightForLength
 *   data={WeightForLengthGirlBirthTo2Years}
 *   title="Weight-for-length"
 *   subtitle="Girls, Birth to 2 years"
 *   width={900}
 *   height={700}
 * />
 * ```
 */
export const D3JsWeightForLength: React.FC<D3JsWeightForLengthProps> = ({
  data,
  width,
  height,
  title,
  subtitle,
  xAxisLabel,
  yAxisLabel,
  margins,
  showGrid,
  showLegend,
  colors,
  className,
  style,
  currentLength,
  currentWeight,
}) => {
  // STEP 1: Create a ref to hold the container DOM element
  // This ref will point to the div that will contain our D3 visualization
  const containerRef = useRef<HTMLDivElement>(null);

  // STEP 2: Memoize the chart options object
  // This prevents creating a new options object on every render
  // The options object only changes when the relevant props actually change
  // This is important because React uses reference equality for object dependencies
  const chartOptions = useMemo<Omit<WeightForLengthChartOptions, "container">>(() => {
    const options: Omit<WeightForLengthChartOptions, "container"> = {};

    // Only include properties that are actually provided (not undefined)
    // This allows the d3js_weight_for_length function to use its defaults
    if (width !== undefined) options.width = width;
    if (height !== undefined) options.height = height;
    if (title !== undefined) options.title = title;
    if (subtitle !== undefined) options.subtitle = subtitle;
    if (xAxisLabel !== undefined) options.xAxisLabel = xAxisLabel;
    if (yAxisLabel !== undefined) options.yAxisLabel = yAxisLabel;
    if (margins !== undefined) options.margins = margins;
    if (showGrid !== undefined) options.showGrid = showGrid;
    if (showLegend !== undefined) options.showLegend = showLegend;
    if (colors !== undefined) options.colors = colors;

    return options;
  }, [width, height, title, subtitle, xAxisLabel, yAxisLabel, margins, showGrid, showLegend, colors]);

  // STEP 3: Effect hook to render the D3 chart
  // This effect runs when:
  // - Component mounts (containerRef.current becomes available)
  // - data array changes (new reference or different values)
  // - chartOptions object changes (when any option prop changes)
  useEffect(() => {
    // STEP 3a: Get the container element from the ref
    // If the ref is not attached yet, exit early
    if (!containerRef.current) {
      return;
    }

    const containerElement = containerRef.current;

    // STEP 3b: Validate that we have data
    // The d3js_weight_for_length function will also validate, but we can fail early
    if (!data || data.length === 0) {
      console.warn("D3JsWeightForLength: data array is empty");
      return;
    }

    // STEP 3c: Call the D3 render function with the container and options
    // The d3js_weight_for_length function handles:
    // - Clearing any existing content (using d3.select(container).selectAll("*").remove())
    // - Creating the SVG and all chart elements
    // - Setting up scales, axes, and data visualization
    // - Adding labels, legends, and other chart elements
    try {
      const finalChartOptions = {
        ...chartOptions,
        container: containerElement, // Pass the actual DOM element, not a selector string
      }
      // Draw the chart
      d3js_weight_for_length(data, finalChartOptions);

      // Draw the point indicating the current weight and length (if provided)
      if (currentLength !== undefined && currentWeight !== undefined) {
        d3js_weight_length_point({ data, chartOptions: finalChartOptions, length: currentLength, weight: currentWeight });
      }
    } catch (error) {
      // Handle any errors during rendering
      console.error("Error rendering D3 weight-for-length chart:", error);
    }

    // STEP 3d: No cleanup needed
    // The d3js_weight_for_length function clears the container before rendering
    // So each render starts with a clean slate
  }, [data, chartOptions, currentLength, currentWeight]); // Dependencies: re-render when data, options, or current measurements change

  // STEP 4: Render the container div
  // This div will be used as the container for the D3 visualization
  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
    />
  );
};
