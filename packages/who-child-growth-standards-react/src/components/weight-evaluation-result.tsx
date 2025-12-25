import { useAtomValue } from "@zedux/react"
import { weightEvaluationRequestAtom, weightForLengthD3jsChartOptionsAtom, weightStatusAtom } from "@/atoms/weight-evaluation-atom"
import { WeightLengthStatus } from "./weight-length-status"
import { D3JsWeightForLength } from "./d3js-weight-for-length"

export const WeightEvaluationResult = () => {
    const weightStatus = useAtomValue(weightStatusAtom)
    const weightForLengthD3jsChartOptions = useAtomValue(weightForLengthD3jsChartOptionsAtom)
    const weightEvaluationRequest = useAtomValue(weightEvaluationRequestAtom)

    return (
        <div className="flex flex-col">
            {/* Display the text according to WeightForLengthEvalulationStatus */}
            {weightStatus?.isOk && <WeightLengthStatus status={weightStatus.value} />}
            {/*TODO: Link to the graph weight for length */}

            {/* Display d3js graph */}
            {weightForLengthD3jsChartOptions &&
                <div className="flex justify-center"><D3JsWeightForLength
                    data={weightForLengthD3jsChartOptions.data}
                    title={weightForLengthD3jsChartOptions.title}
                    subtitle={weightForLengthD3jsChartOptions.subtitle}
                    xAxisLabel={weightForLengthD3jsChartOptions.xAxisLabel}
                    yAxisLabel={weightForLengthD3jsChartOptions.yAxisLabel}
                    margins={weightForLengthD3jsChartOptions.margins}
                    showGrid={weightForLengthD3jsChartOptions.showGrid}
                    currentLength={weightEvaluationRequest?.length}
                    currentWeight={weightEvaluationRequest?.weight}
                    maxWidth={800}
                />
                </div>}
        </div>
    )
}