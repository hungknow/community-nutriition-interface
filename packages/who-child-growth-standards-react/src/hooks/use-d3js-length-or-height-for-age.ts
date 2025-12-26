import { useEffect, useMemo, useRef, useCallback } from "react";
import { useMeasure } from "@uidotdev/usehooks";
import type { 
  LengthForAge, 
  HeighthForAge,
} from "who-child-growth-standards";

/**
 * Chart options interface matching the structure from length-height-for-age-d3js
 * These types should be exported from the package but we define them here for type safety
 * until the package types are properly generated
 */
interface LengthForAgeChartOptions {
  container: HTMLElement | string;
  width: number;
  height: number;
  title?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  margins?: { top: number; right: number; bottom: number; left: number };
  showGrid?: boolean;
  showLegend?: boolean;
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

type HeighthForAgeChartOptions = LengthForAgeChartOptions;

// Import functions from the package
// These are exported from length-height-for-age-d3js which is re-exported from index
// Using dynamic import workaround for TypeScript type resolution
import * as whoStandards from "who-child-growth-standards";

const d3js_length_for_age = (whoStandards as any).d3js_length_for_age as (
  data: LengthForAge[],
  options: LengthForAgeChartOptions
) => void;

const d3js_height_for_age = (whoStandards as any).d3js_height_for_age as (
  data: HeighthForAge[],
  options: HeighthForAgeChartOptions
) => void;

/**
 * Options for the useD3JsLengthOrHeightForAge hook
 * 
 * This hook accepts separate dataset parameters for length and height,
 * and individual chart option fields (not the full chart options object)
 * so React can properly track changes and prevent unnecessary re-renders.
 */
export interface UseD3JsLengthOrHeightForAgeOptions {
  /** Array of LengthForAge data points to render (for children under 13 weeks) */
  lengthForAgeDataset?: LengthForAge[];
  /** Array of HeighthForAge data points to render (for children over 13 weeks) */
  heightForAgeDataset?: HeighthForAge[];

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

  /** Current age in weeks (for LengthForAge) or months (for HeighthForAge) */
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
  
  // effectiveHeight is always calculated from effectiveWidth with a 3/4 ratio
  // Ratio 3/4 means height/width = 3/4, so height = width * 3/4
  const ASPECT_RATIO = 3/4; // height/width ratio
  const effectiveHeight = effectiveWidth !== undefined ? effectiveWidth * ASPECT_RATIO : undefined;

  // STEP 2: Determine which dataset to use
  // Prefer lengthForAgeDataset if provided, otherwise use heightForAgeDataset
  const dataset = useMemo(() => {
    if (lengthForAgeDataset && lengthForAgeDataset.length > 0) {
      return { type: 'length' as const, data: lengthForAgeDataset };
    }
    if (heightForAgeDataset && heightForAgeDataset.length > 0) {
      return { type: 'height' as const, data: heightForAgeDataset };
    }
    return null;
  }, [lengthForAgeDataset, heightForAgeDataset]);

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
      if (dataset.type === 'length') {
        d3js_length_for_age(dataset.data, finalChartOptions as LengthForAgeChartOptions);
      } else {
        d3js_height_for_age(dataset.data, finalChartOptions as HeighthForAgeChartOptions);
      }

      // TODO: Add point drawing functionality if currentAge and currentLengthOrHeight are provided
      // Similar to d3js_weight_length_point, but for length/height-for-age
      // if (currentAge !== undefined && currentLengthOrHeight !== undefined) {
      //   // Draw point on chart
      // }
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

