"use client"

import React from "react";
import type { HeightForAge, LengthForAge, LengthOrHeightForAgeType } from "who-child-growth-standards";
import { useD3JsLengthOrHeightForAge } from "../hooks/use-d3js-length-or-height-for-age";

/**
 * Props for the D3JsLengthOrHeightForAge React component
 * 
 * This component accepts separate dataset parameters and individual chart option fields
 * (not the full chart options object) so React can properly
 * track changes and prevent unnecessary re-renders.
 */
export interface D3JsLengthOrHeightForAgeProps {
  /** Type of length or height for age */
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

  /** Optional CSS class name for the container div */
  className?: string;
  /** Optional inline styles for the container div */
  style?: React.CSSProperties;
  /** Current age in weeks (for LengthForAge) or months (for HeightForAge) */
  currentAge?: number;
  /** Current length or height measurement in cm (Y-axis value) */
  currentLengthOrHeight?: number;
  /** Maximum width in pixels for the chart (optional) */
  maxWidth?: number;
}

/**
 * React component for rendering WHO length/height-for-age growth charts using D3.js
 * 
 * This component uses the useD3JsLengthOrHeightForAge hook internally to handle
 * all the chart rendering logic. The component itself is a thin wrapper that
 * provides the container div and styling.
 * 
 * The component accepts separate dataset parameters for length and height.
 * It will use lengthForAgeDataset if provided, otherwise heightForAgeDataset.
 * 
 * For more control, you can use the useD3JsLengthOrHeightForAge hook directly.
 * 
 * Usage Example:
 * ```tsx
 * import { heightForAgeGirl0To2Years } from "who-child-growth-standards/height-for-age-0-to-2-years";
 * 
 * <D3JsLengthOrHeightForAge
 *   heightForAgeDataset={heightForAgeGirl0To2Years}
 *   title="Height-for-age"
 *   subtitle="Girls, Birth to 2 years"
 * />
 * ```
 */
export const D3JsLengthOrHeightForAge: React.FC<D3JsLengthOrHeightForAgeProps> = ({
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
  className,
  style,
  currentAge,
  currentLengthOrHeight,
  maxWidth,
}) => {
  // Use the custom hook to handle all the D3 chart logic
  const { ref, effectiveHeight } = useD3JsLengthOrHeightForAge({
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
      id="d3js-length-or-height-for-age-container"
      ref={ref}
      className={className}
      style={containerStyle}
    />
  );
};
