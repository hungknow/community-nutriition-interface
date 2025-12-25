"use client"

import React from "react";
import type { WeightForLength } from "who-child-growth-standards";
import { useD3JsWeightForLength } from "../hooks/use-d3js-weight-for-length";

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
 * This component uses the useD3JsWeightForLength hook internally to handle
 * all the chart rendering logic. The component itself is a thin wrapper that
 * provides the container div and styling.
 * 
 * For more control, you can use the useD3JsWeightForLength hook directly.
 * 
 * Usage Example:
 * ```tsx
 * import { WeightForLengthGirlBirthTo2Years } from "who-child-growth-standards/weight-for-length-0-to-2-years";
 * 
 * <D3JsWeightForLength
 *   data={WeightForLengthGirlBirthTo2Years}
 *   title="Weight-for-length"
 *   subtitle="Girls, Birth to 2 years"
 * />
 * ```
 */
export const D3JsWeightForLength: React.FC<D3JsWeightForLengthProps> = ({
  data,
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
  // Use the custom hook to handle all the D3 chart logic
  const { ref, effectiveHeight } = useD3JsWeightForLength({
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
  });

  // Render the container div
  // This div will be used as the container for the D3 visualization
  // Make it responsive - always use 100% width and measured height
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: effectiveHeight !== undefined ? `${effectiveHeight}px` : 'auto',
    ...style,
  };

  return (
    <div
      id="d3js-weight-for-length-container"
      ref={ref}
      className={className}
      style={containerStyle}
    />
  );
};
