import { atom, useAtomValue } from "@zedux/react";
import { evaluateWeightSinceBirth, Gender, getWeightForLengthByBirthDate } from "who-child-growth-standards";

interface WeightEvaluationRequest {
    length: number
    weight: number
    gender: Gender
    birthdate: Date
}

export const weightEvaluationRequestAtom = atom<WeightEvaluationRequest | null>('weight-evaluation', null)
export const weightStatusAtom = atom('weight-status', () => {
    const weightEvaluation = useAtomValue(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return null
    }
    const weightStatus = evaluateWeightSinceBirth(weightEvaluation.weight, weightEvaluation.length, weightEvaluation.birthdate, weightEvaluation.gender)
    return weightStatus
})

export const weightForLengthD3jsChartOptionsAtom = atom('weight-for-length-d3js-chart-options', () => {
    const weightEvaluation = useAtomValue(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return null
    }
    const data = getWeightForLengthByBirthDate(weightEvaluation.birthdate, weightEvaluation.gender)
    if (!data) {
        return null
    }

    return {
        data: data,
        width: 800,
        height: 600,
        title: "Weight-for-length",
        subtitle: "Girls, Birth to 2 years",
        xAxisLabel: "Length (cm)",
        yAxisLabel: "Weight (kg)",
        margins: { top: 60, right: 80, bottom: 60, left: 80 },
        showGrid: true,
        showLegend: true,
    }
})
