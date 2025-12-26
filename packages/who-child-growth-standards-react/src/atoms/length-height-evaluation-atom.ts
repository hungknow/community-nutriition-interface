import { t } from "@/i18n/i18n-functions"
import { errorToResult } from "@/utils/badrap-result"
import { Result } from "@badrap/result"
import { atom, injectEcosystem } from "@zedux/react"
import { evaluateLengthOrHeightForAge, Gender, getLengthOrHeightForAgeDataset, LengthHeightForAgeEvalulationStatus } from "who-child-growth-standards"

interface LengthOrHeightForAgeEvaluationRequest {
    lengthOrHeight: number
    weight: number
    gender: Gender
    birthdate: Date
}

export const lengthOrHeightEvaluationRequestAtom = atom<LengthOrHeightForAgeEvaluationRequest | null>('length-or-height-for-age-evaluation', null)

export const lengthOrHeightEvaluationStatusAtom = atom('length-or-height-for-age-evaluation-status', () => {
    const { get } = injectEcosystem()
    const lengthOrHeightEvaluationRequest = get(lengthOrHeightEvaluationRequestAtom)
    if (!lengthOrHeightEvaluationRequest) {
        return undefined
    }
    try {
        const status = evaluateLengthOrHeightForAge(lengthOrHeightEvaluationRequest.lengthOrHeight, lengthOrHeightEvaluationRequest.birthdate, lengthOrHeightEvaluationRequest.gender)
        return Result.ok(status)
    } catch (error) {
        return errorToResult<LengthHeightForAgeEvalulationStatus, unknown>(error)
    }
})

export const lengthOrHeightDatasetAtom = atom('length-or-height-for-age-data', () => {
    const { get } = injectEcosystem()
    const lengthOrHeightEvaluationRequest = get(lengthOrHeightEvaluationRequestAtom)
    if (!lengthOrHeightEvaluationRequest) {
        return undefined
    }
    const { lengthForAge, heightForAge } = getLengthOrHeightForAgeDataset(lengthOrHeightEvaluationRequest.birthdate, lengthOrHeightEvaluationRequest.gender)
    if (!lengthForAge && !heightForAge) {
        return undefined
    }
    return { lengthForAge, heightForAge }
})

export const lengthOrHeightForAgeD3jsChartOptionsAtom = atom('length-or-height-for-age-d3js-chart-options', () => {
    const { get } = injectEcosystem()

    const weightEvaluation = get(lengthOrHeightEvaluationRequestAtom)
    if (!weightEvaluation) {
        return undefined
    }
    const data = get(lengthOrHeightDatasetAtom)
    if (!data || (!data.lengthForAge && !data.heightForAge)) {
        return undefined
    }

    return {
        lengthForAgeDataset: data.lengthForAge,
        heightForAgeDataset: data.heightForAge,
        title: t('length-or-height-for-age-d3js-chart-options.title'),
        subtitle: undefined,
        xAxisLabel: t('length-or-height-for-age-d3js-chart-options.x-axis-label'),
        yAxisLabel: t('length-or-height-for-age-d3js-chart-options.y-axis-label'),
        margins: { top: 60, right: 80, bottom: 60, left: 80 },
        showGrid: true,
        showLegend: true,
    }
})
