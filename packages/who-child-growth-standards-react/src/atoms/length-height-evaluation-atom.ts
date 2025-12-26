import { t } from "@/i18n/i18n-functions"
import { errorToResult } from "@/utils/badrap-result"
import { Result } from "@badrap/result"
import { atom, injectEcosystem } from "@zedux/react"
import { calculateMonthsSinceBirth, evaluateLengthOrHeightForAge, Gender, getHeightForAgeDataset, getLengthForAgeDataset, getLengthOrHeightForAgeType, LengthHeightForAgeEvalulationStatus, LengthOrHeightForAgeType } from "who-child-growth-standards"

interface LengthOrHeightForAgeEvaluationRequest {
    lengthOrHeight: number
    gender: Gender
    dateOfBirth: Date
}

export const lengthOrHeightEvaluationRequestAtom = atom<LengthOrHeightForAgeEvaluationRequest | null>('length-or-height-for-age-evaluation', null)

export const lengthOrHeightEvaluationStatusAtom = atom('length-or-height-for-age-evaluation-status', () => {
    const { get } = injectEcosystem()
    const lengthOrHeightEvaluationRequest = get(lengthOrHeightEvaluationRequestAtom)
    if (!lengthOrHeightEvaluationRequest) {
        return undefined
    }
    try {
        const status = evaluateLengthOrHeightForAge(lengthOrHeightEvaluationRequest.lengthOrHeight, lengthOrHeightEvaluationRequest.dateOfBirth, lengthOrHeightEvaluationRequest.gender)
        return Result.ok(status)
    } catch (error) {
        return errorToResult<LengthHeightForAgeEvalulationStatus, unknown>(error)
    }
})

export const lengthOrHeightForAgeTypeAtom = atom('length-or-height-for-age-type', () => {
    const { get } = injectEcosystem()
    const lengthOrHeightEvaluationRequest = get(lengthOrHeightEvaluationRequestAtom)
    if (!lengthOrHeightEvaluationRequest) {
        return undefined
    }
    return getLengthOrHeightForAgeType(lengthOrHeightEvaluationRequest.dateOfBirth)
})

export const lengthOrHeightDatasetAtom = atom('length-or-height-for-age-data', () => {
    const { get } = injectEcosystem()
    const lengthOrHeightEvaluationRequest = get(lengthOrHeightEvaluationRequestAtom)
    if (!lengthOrHeightEvaluationRequest) {
        return undefined
    }
    const lengthOrHeightForAgeType = get(lengthOrHeightForAgeTypeAtom)
    if (!lengthOrHeightForAgeType) {
        return undefined
    }
    if (lengthOrHeightForAgeType == LengthOrHeightForAgeType.Length) {
        return {
            lengthForAge: getLengthForAgeDataset(lengthOrHeightEvaluationRequest.dateOfBirth, lengthOrHeightEvaluationRequest.gender),
            heightForAge: undefined,
        }
    } else {
        return {
            lengthForAge: undefined,
            heightForAge: getHeightForAgeDataset(lengthOrHeightEvaluationRequest.dateOfBirth, lengthOrHeightEvaluationRequest.gender),
        }
    }
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

    const lengthOrHeightForAgeType = get(lengthOrHeightForAgeTypeAtom)
    if (!lengthOrHeightForAgeType) {
        return undefined
    }

    if (lengthOrHeightForAgeType == LengthOrHeightForAgeType.Length) {
        return {
            lengthOrHeightForAgeType,
            lengthForAgeDataset: data.lengthForAge,
            heightForAgeDataset: undefined,
            title: t('length-or-height-for-age-d3js-chart-options.title-length'),
            subtitle: undefined,
            xAxisLabel: t('length-or-height-for-age-d3js-chart-options.x-axis-label-weeks'),
            yAxisLabel: t('length-or-height-for-age-d3js-chart-options.y-axis-label'),
            currentAge: calculateMonthsSinceBirth(weightEvaluation.dateOfBirth),
            currentLengthOrHeight: weightEvaluation.lengthOrHeight,
        }
    } else {
        return {
            lengthOrHeightForAgeType,
            lengthForAgeDataset: undefined,
            heightForAgeDataset: data.heightForAge,
            title: t('length-or-height-for-age-d3js-chart-options.title-height'),
            subtitle: undefined,
            xAxisLabel: t('length-or-height-for-age-d3js-chart-options.x-axis-label-months'),
            yAxisLabel: t('length-or-height-for-age-d3js-chart-options.y-axis-label'),
            currentAge: calculateMonthsSinceBirth(weightEvaluation.dateOfBirth),
            currentLengthOrHeight: weightEvaluation.lengthOrHeight,
        }
    }
})
