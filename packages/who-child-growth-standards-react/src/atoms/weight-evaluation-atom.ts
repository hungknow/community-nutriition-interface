import { atom, injectEcosystem } from "@zedux/react";
import { evaluateWeightSinceBirth, Gender, getWeightForLengthByBirthDate, WeightForLengthEvalulationStatus } from "who-child-growth-standards";
import { Result } from "@badrap/result";
import { errorToResult } from "@/utils/badrap-result";
import { t } from "@/i18n/i18n-functions";

interface WeightEvaluationRequest {
    length: number
    weight: number
    gender: Gender
    dateOfBirth: Date
}

export const weightEvaluationRequestAtom = atom<WeightEvaluationRequest | null>('weight-evaluation', null)

export const weightStatusAtom = atom('weight-status', () => {
    const { get } = injectEcosystem()
    const weightEvaluation = get(weightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return undefined
    }
    try {
        const weightStatus = evaluateWeightSinceBirth(weightEvaluation.weight, weightEvaluation.length, weightEvaluation.dateOfBirth, weightEvaluation.gender)
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
    const data = getWeightForLengthByBirthDate(weightEvaluation.dateOfBirth, weightEvaluation.gender)
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
        title: t('weight-for-length-d3js-chart-options.title'),
        subtitle: undefined,
        xAxisLabel: t('weight-for-length-d3js-chart-options.x-axis-label'),
        yAxisLabel: t('weight-for-length-d3js-chart-options.y-axis-label'),
        margins: { top: 60, right: 80, bottom: 60, left: 80 },
        showGrid: true,
        showLegend: true,
    }
})
