"use client"

import React from "react";
import type { WeightForAgeDataset } from "who-child-growth-standards";
import { useD3JsWeightForAge } from "../hooks/use-d3js-weight-for-age";

/**
 * Props for the D3JsWeightForAge React component
 * 
 * This component accepts the WeightForAgeDataset and individual chart option fields
 * (not the full chart options object) so React can properly
 * track changes and prevent unnecessary re-renders.
 */
export interface D3JsWeightForAgeProps {
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

  /** Optional CSS class name for the container div */
  className?: string;
  /** Optional inline styles for the container div */
  style?: React.CSSProperties;
  /** Date of birth to calculate current age */
  dateOfBirth: Date;
  /** Current weight measurement in kg (Y-axis value) */
  currentWeight?: number;
  /** Maximum width in pixels for the chart (optional) */
  maxWidth?: number;
}

/**
 * React component for rendering WHO weight-for-age growth charts using D3.js
 * 
 * This component uses the useD3JsWeightForAge hook internally to handle
 * all the chart rendering logic. The component itself is a thin wrapper that
 * provides the container div and styling.
 * 
 * The component accepts a WeightForAgeDataset which can contain either
 * week-based or month-based data. It will automatically use the appropriate
 * chart rendering function based on the dataset type.
 * 
 * For more control, you can use the useD3JsWeightForAge hook directly.
 * 
 * Usage Example:
 * ```tsx
 * import { getWeightForAgeDataset } from "who-child-growth-standards";
 * 
 * const dataset = getWeightForAgeDataset({ 
 *   dateOfBirth: new Date('2023-01-01'),
 *   gender: Gender.Female 
 * });
 * 
 * <D3JsWeightForAge
 *   data={dataset}
 *   title="Weight-for-age"
 *   subtitle="Girls, Birth to 5 years"
 *   dateOfBirth={new Date('2023-01-01')}
 *   currentWeight={8.5}
 * />
 * ```
 */
export const D3JsWeightForAge: React.FC<D3JsWeightForAgeProps> = ({
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
  dateOfBirth,
  currentWeight,
  maxWidth,
}) => {
  // Use the custom hook to handle all the D3 chart logic
  const { ref, effectiveHeight } = useD3JsWeightForAge({
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
  });

  // Render the container div
  // This div will be used as the container for the D3 visualization
  // Make it responsive - always use 100% width and measured/calculated height
  // The hook calculates effectiveHeight from effectiveWidth when needed
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: effectiveHeight !== undefined ? `${effectiveHeight}px` : 'auto',
    ...(maxWidth !== undefined && { maxWidth: `${maxWidth}px` }),
    ...style,
  };

  return (
    <div
      id="d3js-weight-for-age-container"
      ref={ref}
      className={className}
      style={containerStyle}
    />
  );
};

