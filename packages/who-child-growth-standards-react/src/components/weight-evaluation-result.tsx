import { useAtomValue } from "@zedux/react"
import { weightForLengthD3jsChartOptionsAtom, weightStatusAtom } from "@/atoms/weight-evaluation-atom"
import { WeightLengthStatus } from "./weight-length-status"
import { D3JsWeightForLength } from "./d3js-weight-for-length"

export const WeightEvaluationResult = () => {
    const weightStatus = useAtomValue(weightStatusAtom)
    const weightForLengthD3jsChartOptions = useAtomValue(weightForLengthD3jsChartOptionsAtom)

    return (
        <div>
            <h1>Weight Evaluation Result</h1>
            {/* Display the text according to WeightEvalulationStatus */}
            {weightStatus && <WeightLengthStatus status={weightStatus} />}

            {/* Display d3js graph */}
            {weightForLengthD3jsChartOptions && <D3JsWeightForLength
                data={weightForLengthD3jsChartOptions.data}
                width={weightForLengthD3jsChartOptions.width}
                height={weightForLengthD3jsChartOptions.height}
                title={weightForLengthD3jsChartOptions.title}
                subtitle={weightForLengthD3jsChartOptions.subtitle}
                xAxisLabel={weightForLengthD3jsChartOptions.xAxisLabel}
                yAxisLabel={weightForLengthD3jsChartOptions.yAxisLabel}
                margins={weightForLengthD3jsChartOptions.margins}
                showGrid={weightForLengthD3jsChartOptions.showGrid} />}
        </div>
    )
}