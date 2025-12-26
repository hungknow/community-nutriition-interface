import { useEffect, useMemo, useRef, useCallback } from "react";
import { useMeasure } from "@uidotdev/usehooks";
import { 
  WeightForAgeByWeek, 
  WeightForAgeByMonth,
  WeightForAgeDataset,
  WeightForAgeType,
  calculateWeeksBetweenDates,
  calculateMonthsSinceBirth,
} from "who-child-growth-standards";

// Import functions from the package
import { 
  d3js_weight_for_age_by_week, 
  d3js_weight_for_age_by_month,
  d3js_growth_chart_point,
} from "who-child-growth-standards";

// Define chart options type locally (matching BaseChartOptions structure)
interface ChartOptions {
  container: HTMLElement;
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

// Define z-score curves for weight-for-age charts
// These match the ALL_Z_SCORE_CURVES from the package
const WEIGHT_FOR_AGE_Z_SCORE_CURVES = [
  { key: "sd3neg" as const, label: "-3 SD", zScore: -3 },
  { key: "sd2neg" as const, label: "-2 SD", zScore: -2 },
  { key: "sd1neg" as const, label: "-1 SD", zScore: -1 },
  { key: "sd0" as const, label: "Median", zScore: 0 },
  { key: "sd1" as const, label: "+1 SD", zScore: 1 },
  { key: "sd2" as const, label: "+2 SD", zScore: 2 },
  { key: "sd3" as const, label: "+3 SD", zScore: 3 },
] as const;

/**
 * Options for the useD3JsWeightForAge hook
 * 
 * This hook accepts a WeightForAgeDataset and individual chart option fields
 * (not the full chart options object) so React can properly
 * track changes and prevent unnecessary re-renders.
 */
export interface UseD3JsWeightForAgeOptions {
  /** WeightForAgeDataset containing type and data (either by week or by month) */
  data: WeightForAgeDataset;

  /** Chart title */
  title?: string;
  /** Subtitle (e.g., "Girls, Birth to 5 years") */
  subtitle?: string;
  /** X-axis label (default: "Age (weeks)" for week-based, "Age (months)" for month-based) */
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

  /** Date of birth to calculate current age */
  dateOfBirth: Date;
  /** Current weight measurement in kg (Y-axis value) */
  currentWeight?: number;
  /** Maximum width in pixels for the chart (optional) */
  maxWidth?: number;
}

/**
 * Return type for the useD3JsWeightForAge hook
 */
export interface UseD3JsWeightForAgeReturn {
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
 * Custom hook for rendering WHO weight-for-age growth charts using D3.js
 * 
 * Logic Flow:
 * 1. Use useMeasure hook to track container dimensions
 * 2. Memoize the chart options object to prevent unnecessary re-renders
 *    - Only recreates when relevant options actually change
 * 3. Calculate current age (weeks or months) from date of birth
 * 4. When hook runs or data/options change:
 *    a. Get the container element from the ref
 *    b. Call d3js_weight_for_age_by_week or d3js_weight_for_age_by_month with the data and options
 *    c. The D3 function handles clearing existing content and rendering the chart
 *    d. If currentWeight is provided, draw a point on the chart
 * 5. React automatically tracks changes to data and individual option props
 *    - This allows React to detect when re-rendering is needed
 * 
 * Usage Example:
 * ```tsx
 * const { ref, effectiveHeight, canRender } = useD3JsWeightForAge({
 *   data: weightForAgeDataset,
 *   title: "Weight-for-age",
 *   subtitle: "Girls, Birth to 5 years",
 *   dateOfBirth: new Date('2023-01-01'),
 *   currentWeight: 8.5,
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
export function useD3JsWeightForAge(
  options: UseD3JsWeightForAgeOptions
): UseD3JsWeightForAgeReturn {
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
    dateOfBirth,
    currentWeight,
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

  // STEP 2: Calculate current age based on dataset type
  const currentAge = useMemo(() => {
    if (data.type === WeightForAgeType.Length) {
      // For week-based data, calculate weeks since birth
      return calculateWeeksBetweenDates(dateOfBirth, new Date());
    } else {
      // For month-based data, calculate months since birth
      return calculateMonthsSinceBirth(dateOfBirth);
    }
  }, [data.type, dateOfBirth]);

  // STEP 3: Memoize the chart options object
  // This prevents creating a new options object on every render
  // The options object only changes when the relevant props actually change
  // This is important because React uses reference equality for object dependencies
  const chartOptions = useMemo<Omit<ChartOptions, "container"> | null>(() => {
    // Don't create options if dimensions are not available
    if (effectiveWidth === undefined || effectiveHeight === undefined) {
      return null;
    }

    const chartOpts: Omit<ChartOptions, "container"> = {
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

    // STEP 4c: Validate that we have data
    // The d3js functions will also validate, but we can fail early
    if (!data || !data.data || data.data.length === 0) {
      console.warn("useD3JsWeightForAge: data array is empty");
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
      if (data.type === WeightForAgeType.Length) {
        d3js_weight_for_age_by_week(data.data as WeightForAgeByWeek[], finalChartOptions as ChartOptions);
        
        // Draw point on chart if currentWeight is provided
        if (currentWeight !== undefined) {
          d3js_growth_chart_point({
            data: data.data as WeightForAgeByWeek[],
            chartOptions: finalChartOptions,
            xValue: currentAge,
            yValue: currentWeight,
            getXValue: (d: WeightForAgeByWeek) => d.week,
            getYValue: (d: WeightForAgeByWeek, curveKey: "sd3neg" | "sd2neg" | "sd1neg" | "sd0" | "sd1" | "sd2" | "sd3") => d[curveKey] as number,
            curves: WEIGHT_FOR_AGE_Z_SCORE_CURVES,
            yPadding: 0.05,
            defaultYMax: 20,
          });
        }
      } else {
        d3js_weight_for_age_by_month(data.data as WeightForAgeByMonth[], finalChartOptions as ChartOptions);
        
        // Draw point on chart if currentWeight is provided
        if (currentWeight !== undefined) {
          d3js_growth_chart_point({
            data: data.data as WeightForAgeByMonth[],
            chartOptions: finalChartOptions,
            xValue: currentAge,
            yValue: currentWeight,
            getXValue: (d: WeightForAgeByMonth) => d.month,
            getYValue: (d: WeightForAgeByMonth, curveKey: "sd3neg" | "sd2neg" | "sd1neg" | "sd0" | "sd1" | "sd2" | "sd3") => d[curveKey] as number,
            curves: WEIGHT_FOR_AGE_Z_SCORE_CURVES,
            yPadding: 0.05,
            defaultYMax: 20,
          });
        }
      }
    } catch (error) {
      // Handle any errors during rendering
      console.error("Error rendering D3 weight-for-age chart:", error);
    }

    // STEP 4e: No cleanup needed
    // The d3js functions clear the container before rendering
    // So each render starts with a clean slate
  }, [data, chartOptions, currentAge, currentWeight, canRender]); // Dependencies: re-render when data, options, or current measurements change

  return {
    ref,
    effectiveWidth,
    effectiveHeight,
    canRender,
  };
}

