import { useEffect, useMemo, useRef, useCallback } from "react";
import { useMeasure } from "@uidotdev/usehooks";
import { 
  LengthForAge, 
  HeightForAge,
  LengthOrHeightForAgeType,
} from "who-child-growth-standards";

// Import functions from the package
// These are exported from length-height-for-age-d3js which is re-exported from index
import { 
  d3js_length_for_age, 
  d3js_height_for_age,
  type LengthForAgeChartOptions,
  type HeighthForAgeChartOptions,
  d3js_growth_chart_point,
  LENGTH_HEIGHT_Z_SCORE_CURVES,
} from "who-child-growth-standards";

/**
 * Options for the useD3JsLengthOrHeightForAge hook
 * 
 * This hook accepts separate dataset parameters for length and height,
 * and individual chart option fields (not the full chart options object)
 * so React can properly track changes and prevent unnecessary re-renders.
 */
export interface UseD3JsLengthOrHeightForAgeOptions {
  /** Type of measurement: length or height */
  lengthOrHeightForAgeType: LengthOrHeightForAgeType;
  /** Array of LengthForAge data points to render (for children under 13 weeks) */
  lengthForAgeDataset?: LengthForAge[];
  /** Array of HeightForAge data points to render (for children over 13 weeks) */
  heightForAgeDataset?: HeightForAge[];

  /** Chart title */
  title?: string;
  /** Subtitle (e.g., "Girls, Birth to 2 years") */
  subtitle?: string;
  /** X-axis label (default: "Age (weeks)" for length, "Age (months)" for height) */
  xAxisLabel?: string;
  /** Y-axis label (default: "Length (cm)" for length, "Height (cm)" for height) */
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

  /** Current age in weeks (for LengthForAge) or months (for HeightForAge) */
  currentAge?: number;
  /** Current length or height measurement in cm (Y-axis value) */
  currentLengthOrHeight?: number;
  /** Maximum width in pixels for the chart (optional) */
  maxWidth?: number;
}

/**
 * Return type for the useD3JsLengthOrHeightForAge hook
 */
export interface UseD3JsLengthOrHeightForAgeReturn {
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
 * Custom hook for rendering WHO length/height-for-age growth charts using D3.js
 * 
 * Logic Flow:
 * 1. Use useMeasure hook to track container dimensions
 * 2. Determine which dataset to use (lengthForAgeDataset or heightForAgeDataset)
 *    - Prefers lengthForAgeDataset if both are provided
 * 3. Memoize the chart options object to prevent unnecessary re-renders
 *    - Only recreates when relevant options actually change
 * 4. When hook runs or dataset/options change:
 *    a. Get the container element from the ref
 *    b. Call d3js_length_for_age or d3js_height_for_age with the appropriate dataset and options
 *    c. The D3 function handles clearing existing content and rendering the chart
 * 5. React automatically tracks changes to dataset and individual option props
 *    - This allows React to detect when re-rendering is needed
 * 
 * Usage Example:
 * ```tsx
 * const { ref, effectiveHeight, canRender } = useD3JsLengthOrHeightForAge({
 *   heightForAgeDataset: HeightForAgeGirl0To2Years,
 *   title: "Height-for-age",
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
export function useD3JsLengthOrHeightForAge(
  options: UseD3JsLengthOrHeightForAgeOptions
): UseD3JsLengthOrHeightForAgeReturn {
  const {
    lengthOrHeightForAgeType,
    lengthForAgeDataset,
    heightForAgeDataset,
    title,
    subtitle,
    xAxisLabel,
    yAxisLabel,
    margins,
    showGrid,
    showLegend,
    colors,
    currentAge,
    currentLengthOrHeight,
    maxWidth,
  } = options;

  // STEP 1: Use useMeasure hook to track container dimensions
  // This hook uses ResizeObserver internally to monitor size changes
  const [measureRef, { width: measuredWidth }] = useMeasure<HTMLDivElement>();
  
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
  
  // effectiveHeight is always calculated from effectiveWidth with a 3/4 ratio
  // Ratio 3/4 means height/width = 3/4, so height = width * 3/4
  const ASPECT_RATIO = 3/4; // height/width ratio
  const effectiveHeight = effectiveWidth !== undefined ? effectiveWidth * ASPECT_RATIO : undefined;

  // STEP 2: Determine which dataset to use based on lengthOrHeightForAgeType
  const dataset = useMemo(() => {
    if (lengthOrHeightForAgeType === LengthOrHeightForAgeType.Length) {
      if (lengthForAgeDataset && lengthForAgeDataset.length > 0) {
        return { type: lengthOrHeightForAgeType, data: lengthForAgeDataset };
      }
    } else if (lengthOrHeightForAgeType === LengthOrHeightForAgeType.Height) {
      if (heightForAgeDataset && heightForAgeDataset.length > 0) {
        return { type: lengthOrHeightForAgeType, data: heightForAgeDataset };
      }
    }
    return null;
  }, [lengthOrHeightForAgeType, lengthForAgeDataset, heightForAgeDataset]);

  // STEP 3: Memoize the chart options object
  // This prevents creating a new options object on every render
  // The options object only changes when the relevant props actually change
  // This is important because React uses reference equality for object dependencies
  const chartOptions = useMemo<Omit<LengthForAgeChartOptions | HeighthForAgeChartOptions, "container"> | null>(() => {
    // Don't create options if dimensions are not available
    if (effectiveWidth === undefined || effectiveHeight === undefined) {
      return null;
    }

    const chartOpts: Omit<LengthForAgeChartOptions, "container"> = {
      width: effectiveWidth,
      height: effectiveHeight,
    };

    // Add optional properties
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

  // STEP 4: Effect hook to render the D3 chart
  // This effect runs when:
  // - Component mounts (containerRef.current becomes available)
  // - data array changes (new reference or different values)
  // - chartOptions object changes (when any option prop changes)
  useEffect(() => {
    // STEP 4a: Get the container element from the ref
    // If the ref is not attached yet, exit early
    const containerElement = elementRef.current;
    
    if (!containerElement) {
      return;
    }

    // STEP 4b: Don't render if we don't have valid dimensions
    if (!canRender || !chartOptions) {
      return;
    }

    // STEP 4c: Validate that we have a dataset
    // The d3js functions will also validate, but we can fail early
    if (!dataset) {
      console.warn("useD3JsLengthOrHeightForAge: no dataset provided (lengthForAgeDataset or heightForAgeDataset)");
      return;
    }

    // STEP 4d: Call the appropriate D3 render function with the container and options
    // The d3js functions handle:
    // - Clearing any existing content (using d3.select(container).selectAll("*").remove())
    // - Creating the SVG and all chart elements
    // - Setting up scales, axes, and data visualization
    // - Adding labels, legends, and other chart elements
    try {
      const finalChartOptions = {
        ...chartOptions,
        container: containerElement, // Pass the actual DOM element, not a selector string
      };

      // Draw the chart based on dataset type
      if (dataset.type === LengthOrHeightForAgeType.Length) {
        d3js_length_for_age(dataset.data, finalChartOptions as LengthForAgeChartOptions);
      } else {
        d3js_height_for_age(dataset.data, finalChartOptions as HeighthForAgeChartOptions);
      }

      // Draw point on chart if currentAge and currentLengthOrHeight are provided
      if (currentAge !== undefined && currentLengthOrHeight !== undefined) {
        if (dataset.type === LengthOrHeightForAgeType.Length) {
          d3js_growth_chart_point({
            data: dataset.data,
            chartOptions: finalChartOptions,
            xValue: currentAge,
            yValue: currentLengthOrHeight,
            getXValue: (d: LengthForAge) => d.week,
            getYValue: (d: LengthForAge, curveKey: "sd3neg" | "sd2neg" | "sd1neg" | "sd0" | "sd1" | "sd2" | "sd3") => d[curveKey] as number,
            curves: LENGTH_HEIGHT_Z_SCORE_CURVES,
            yPadding: 0.05,
            defaultYMax: 100,
          });
        } else {
          d3js_growth_chart_point({
            data: dataset.data,
            chartOptions: finalChartOptions,
            xValue: currentAge,
            yValue: currentLengthOrHeight,
            getXValue: (d: HeightForAge) => d.month,
            getYValue: (d: HeightForAge, curveKey: "sd3neg" | "sd2neg" | "sd1neg" | "sd0" | "sd1" | "sd2" | "sd3") => d[curveKey] as number,
            curves: LENGTH_HEIGHT_Z_SCORE_CURVES,
            yPadding: 0.05,
            defaultYMax: 100,
          });
        }
      }
    } catch (error) {
      // Handle any errors during rendering
      console.error("Error rendering D3 length/height-for-age chart:", error);
    }

    // STEP 4e: No cleanup needed
    // The d3js functions clear the container before rendering
    // So each render starts with a clean slate
  }, [dataset, chartOptions, currentAge, currentLengthOrHeight, canRender]); // Dependencies: re-render when dataset, options, or current measurements change

  return {
    ref,
    effectiveWidth,
    effectiveHeight,
    canRender,
  };
}

