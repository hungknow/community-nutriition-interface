import { useAtomValue } from "@zedux/react"
import { weightEvaluationRequestAtom, weightForLengthD3jsChartOptionsAtom, weightStatusAtom } from "@/atoms/weight-evaluation-atom"
import { WeightLengthStatus } from "./weight-length-status"
import { D3JsWeightForLength } from "./d3js-weight-for-length"
import { lengthOrHeightEvaluationStatusAtom, lengthOrHeightForAgeD3jsChartOptionsAtom } from "@/atoms/length-height-evaluation-atom"
import { LengthOrHeightForAgeStatus } from "./length-or-height-for-age-status"
import { D3JsLengthOrHeightForAge } from "./d3js-length-or-height-for-age"
import { weightForAgeD3jsChartOptionsAtom, weightForAgeEvaluationRequestAtom } from "@/atoms/weight-for-age-evaluation-atom"
import { D3JsWeightForAge } from "./d3js-weight-for-age"

export const WeightLengthHeightEvaluationResult = () => {
    const weightStatus = useAtomValue(weightStatusAtom)
    const weightForLengthD3jsChartOptions = useAtomValue(weightForLengthD3jsChartOptionsAtom)
    const weightEvaluationRequest = useAtomValue(weightEvaluationRequestAtom)
    
    const lengthOrHeightEvaluationStatusResult = useAtomValue(lengthOrHeightEvaluationStatusAtom)
    const lengthOrHeightForAgeD3jsChartOptions = useAtomValue(lengthOrHeightForAgeD3jsChartOptionsAtom)

    const weightForAgeD3jsChartOptions = useAtomValue(weightForAgeD3jsChartOptionsAtom)
    const weightForAgeEvaluationRequest = useAtomValue(weightForAgeEvaluationRequestAtom)

    return (
        <div className="flex flex-col gap-4">
            {/* Display the text according to WeightForLengthEvalulationStatus */}
            {weightStatus?.isOk && <WeightLengthStatus status={weightStatus.value} />}
            {lengthOrHeightEvaluationStatusResult?.isOk && <LengthOrHeightForAgeStatus status={lengthOrHeightEvaluationStatusResult.value} />}

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

            {lengthOrHeightForAgeD3jsChartOptions &&
                <div className="flex justify-center"><D3JsLengthOrHeightForAge
                    lengthOrHeightForAgeType={lengthOrHeightForAgeD3jsChartOptions.lengthOrHeightForAgeType}
                    lengthForAgeDataset={lengthOrHeightForAgeD3jsChartOptions.lengthForAgeDataset}
                    heightForAgeDataset={lengthOrHeightForAgeD3jsChartOptions.heightForAgeDataset}
                    title={lengthOrHeightForAgeD3jsChartOptions.title}
                    subtitle={lengthOrHeightForAgeD3jsChartOptions.subtitle}
                    xAxisLabel={lengthOrHeightForAgeD3jsChartOptions.xAxisLabel}
                    yAxisLabel={lengthOrHeightForAgeD3jsChartOptions.yAxisLabel}
                    maxWidth={800}
                    currentAge={lengthOrHeightForAgeD3jsChartOptions.currentAge}
                    currentLengthOrHeight={lengthOrHeightForAgeD3jsChartOptions.currentLengthOrHeight}
                />
                </div>}

            {weightForAgeD3jsChartOptions &&
                <div className="flex justify-center"><D3JsWeightForAge
                    data={weightForAgeD3jsChartOptions.data}
                    title={weightForAgeD3jsChartOptions.title}
                    subtitle={weightForAgeD3jsChartOptions.subtitle}
                    xAxisLabel={weightForAgeD3jsChartOptions.xAxisLabel}
                    yAxisLabel={weightForAgeD3jsChartOptions.yAxisLabel}
                    showGrid={weightForAgeD3jsChartOptions.showGrid}
                    showLegend={weightForAgeD3jsChartOptions.showLegend}
                    maxWidth={800}
                    dateOfBirth={weightForAgeD3jsChartOptions.dateOfBirth}
                    currentWeight={weightForAgeD3jsChartOptions.currentWeight}
                />
                </div>}
        </div>
    )
}