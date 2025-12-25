import { useEffect, useMemo, useRef, useCallback } from "react";
import { useMeasure } from "@uidotdev/usehooks";
import type { WeightForLength, WeightForLengthChartOptions } from "who-child-growth-standards";
import { d3js_weight_for_length, d3js_weight_length_point } from "who-child-growth-standards";

/**
 * Options for the useD3JsWeightForLength hook
 * 
 * This hook accepts the data array and individual chart option fields
 * (not the full WeightForLengthChartOptions object) so React can properly
 * track changes and prevent unnecessary re-renders.
 */
export interface UseD3JsWeightForLengthOptions {
  /** Array of WeightForLength data points to render */
  data: WeightForLength[];

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

  /** Current length measurement in cm (X-axis value) */
  currentLength?: number;
  /** Current weight measurement in kg (Y-axis value) */
  currentWeight?: number;
  /** Maximum width in pixels for the chart (optional) */
  maxWidth?: number;
}

/**
 * Return type for the useD3JsWeightForLength hook
 */
export interface UseD3JsWeightForLengthReturn {
  /** Ref callback to attach to the container div */
  ref: (element: HTMLDivElement | null) => void;
  /** Effective width of the container (undefined if not measured yet) */
  effectiveWidth: number | undefined;
  /** Effective height of the container (undefined if not measured yet) */
  effectiveHeight: number | undefined;
  /** Whether the chart can be rendered (has valid dimensions) */
  canRender: boolean;
}

/**
 * Custom hook for rendering WHO weight-for-length growth charts using D3.js
 * 
 * Logic Flow:
 * 1. Use useMeasure hook to track container dimensions
 * 2. Memoize the chart options object to prevent unnecessary re-renders
 *    - Only recreates when relevant options actually change
 * 3. When hook runs or data/options change:
 *    a. Get the container element from the ref
 *    b. Call d3js_weight_for_length with the data and options
 *    c. The D3 function handles clearing existing content and rendering the chart
 * 4. React automatically tracks changes to data and individual option props
 *    - This allows React to detect when re-rendering is needed
 * 
 * Usage Example:
 * ```tsx
 * const { ref, effectiveHeight, canRender } = useD3JsWeightForLength({
 *   data: WeightForLengthGirlBirthTo2Years,
 *   title: "Weight-for-length",
 *   subtitle: "Girls, Birth to 2 years",
 * });
 * 
 * return (
 *   <div
 *     ref={ref}
 *     style={{ width: '100%', height: effectiveHeight ? `${effectiveHeight}px` : 'auto' }}
 *   />
 * );
 * ```
 */
export function useD3JsWeightForLength(
  options: UseD3JsWeightForLengthOptions
): UseD3JsWeightForLengthReturn {
  const {
    data,
    title,
    subtitle,
    xAxisLabel,
    yAxisLabel,
    margins,
    showGrid,
    showLegend,
    colors,
    currentLength,
    currentWeight,
    maxWidth,
  } = options;

  // STEP 1: Use useMeasure hook to track container dimensions
  // This hook uses ResizeObserver internally to monitor size changes
  const [measureRef, { width: measuredWidth, height: measuredHeight }] = useMeasure<HTMLDivElement>();
  
  // Store the element reference since measureRef is a callback ref
  const elementRef = useRef<HTMLDivElement | null>(null);
  
  // Combined callback ref that stores the element and passes it to useMeasure
  const ref = useCallback((element: HTMLDivElement | null) => {
    elementRef.current = element;
    measureRef(element);
  }, [measureRef]);

  // Always use measured dimensions - no fallback values
  // Apply maxWidth constraint if provided
  let effectiveWidth = measuredWidth && measuredWidth > 0 ? measuredWidth : undefined;
  if (effectiveWidth !== undefined && maxWidth !== undefined) {
    effectiveWidth = Math.min(effectiveWidth, maxWidth);
  }
  
  // effectiveHeight is always calculated from effectiveWidth with a 4/3 ratio
  // Ratio 4/3 means height/width = 4/3, so height = width * 4/3
  const ASPECT_RATIO = 3/4; // height/width ratio
  const effectiveHeight = effectiveWidth !== undefined ? effectiveWidth * ASPECT_RATIO : undefined;

  // STEP 2: Memoize the chart options object
  // This prevents creating a new options object on every render
  // The options object only changes when the relevant props actually change
  // This is important because React uses reference equality for object dependencies
  const chartOptions = useMemo<Omit<WeightForLengthChartOptions, "container"> | null>(() => {
    // Don't create options if dimensions are not available
    if (effectiveWidth === undefined || effectiveHeight === undefined) {
      return null;
    }

    const chartOpts: Omit<WeightForLengthChartOptions, "container"> = {};

    // Use effective dimensions (responsive or provided)
    chartOpts.width = effectiveWidth;
    chartOpts.height = effectiveHeight;
    if (title !== undefined) chartOpts.title = title;
    if (subtitle !== undefined) chartOpts.subtitle = subtitle;
    if (xAxisLabel !== undefined) chartOpts.xAxisLabel = xAxisLabel;
    if (yAxisLabel !== undefined) chartOpts.yAxisLabel = yAxisLabel;
    if (margins !== undefined) chartOpts.margins = margins;
    if (showGrid !== undefined) chartOpts.showGrid = showGrid;
    if (showLegend !== undefined) chartOpts.showLegend = showLegend;
    if (colors !== undefined) chartOpts.colors = colors;

    return chartOpts;
  }, [effectiveWidth, effectiveHeight, title, subtitle, xAxisLabel, yAxisLabel, margins, showGrid, showLegend, colors]);

  // Only render chart if we have valid dimensions
  const canRender = chartOptions !== null;

  // STEP 3: Effect hook to render the D3 chart
  // This effect runs when:
  // - Component mounts (containerRef.current becomes available)
  // - data array changes (new reference or different values)
  // - chartOptions object changes (when any option prop changes)
  useEffect(() => {
    // STEP 3a: Get the container element from the ref
    // If the ref is not attached yet, exit early
    const containerElement = elementRef.current;
    
    if (!containerElement) {
      return;
    }

    // STEP 3b: Don't render if we don't have valid dimensions
    if (!canRender || !chartOptions) {
      return;
    }

    // STEP 3c: Validate that we have data
    // The d3js_weight_for_length function will also validate, but we can fail early
    if (!data || data.length === 0) {
      console.warn("useD3JsWeightForLength: data array is empty");
      return;
    }

    // STEP 3d: Call the D3 render function with the container and options
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

    // STEP 3e: No cleanup needed
    // The d3js_weight_for_length function clears the container before rendering
    // So each render starts with a clean slate
  }, [data, chartOptions, currentLength, currentWeight, canRender]); // Dependencies: re-render when data, options, or current measurements change

  return {
    ref,
    effectiveWidth,
    effectiveHeight,
    canRender,
  };
}

