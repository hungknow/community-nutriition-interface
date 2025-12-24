import { atom, injectEcosystem } from "@zedux/react";
import { evaluateWeightSinceBirth, Gender, getWeightForLengthByBirthDate, WeightForLengthEvalulationStatus } from "who-child-growth-standards";
import { Result } from "@badrap/result";
import { errorToResult } from "@/utils/badrap-result";

interface WeightEvaluationRequest {
    length: number
    weight: number
    gender: Gender
    birthdate: Date
}

export const weightEvaluationRequestAtom = atom<WeightEvaluationRequest | null>('weight-evaluation', null)

export const weightStatusAtom = atom('weight-status', () => {
    const { get } = injectEcosystem()
    const weightEvaluation = get(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return undefined
    }
    try {
        const weightStatus = evaluateWeightSinceBirth(weightEvaluation.weight, weightEvaluation.length, weightEvaluation.birthdate, weightEvaluation.gender)
        return Result.ok(weightStatus)
    } catch (error) {
        return errorToResult<WeightForLengthEvalulationStatus, unknown>(error)
    }
})

export const weightForLengthDataAtom = atom('weight-for-length-data', () => {
    const { get } = injectEcosystem()

    const weightEvaluation = get(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return undefined
    }
    const data = getWeightForLengthByBirthDate(weightEvaluation.birthdate, weightEvaluation.gender)
    return data
})

export const weightForLengthD3jsChartOptionsAtom = atom('weight-for-length-d3js-chart-options', () => {
    const { get } = injectEcosystem()

    const weightEvaluation = get(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return null
    }
    const data = get(weightForLengthDataAtom)
    if (!data) {
        return null
    }

    return {
        data: data,
        width: 800,
        height: 600,
        title: "Weight-for-length",
        subtitle: undefined,
        xAxisLabel: "Length (cm)",
        yAxisLabel: "Weight (kg)",
        margins: { top: 60, right: 80, bottom: 60, left: 80 },
        showGrid: true,
        showLegend: true,
    }
})
