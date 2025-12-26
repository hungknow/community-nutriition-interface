import { t } from "@/i18n/i18n-functions";
import { atom, injectEcosystem } from "@zedux/react";
import { Gender, getWeightForAgeDataset, WeightForAgeType } from "who-child-growth-standards";

interface WeightForAgeEvaluationRequest {
    weight: number
    gender: Gender
    dateOfBirth: Date
}

export const weightForAgeEvaluationRequestAtom = atom<WeightForAgeEvaluationRequest | null>('weight-for-age-evaluation', null)

export const weightForAgeDatasetAtom = atom('weight-for-age-dataset', () => {
    const { get } = injectEcosystem()
    const weightForAgeEvaluationRequest = get(weightForAgeEvaluationRequestAtom)
    if (!weightForAgeEvaluationRequest) {
        return undefined
    }
    return getWeightForAgeDataset({ dateOfBirth: weightForAgeEvaluationRequest.dateOfBirth, gender: weightForAgeEvaluationRequest.gender })
})

export const weightForAgeD3jsChartOptionsAtom = atom('weight-for-age-d3js-chart-options', () => {
    const { get } = injectEcosystem()
    const weightForAgeEvaluationRequest = get(weightForAgeEvaluationRequestAtom)
    if (!weightForAgeEvaluationRequest) {
        return undefined
    }
    const data = get(weightForAgeDatasetAtom)
    if (!data) {
        return undefined
    }

    if (data.type === WeightForAgeType.Length) {
        return {
            data: data,
            title: t('weight-for-age-d3js-chart-options.title-week'),
            subtitle: undefined,
            xAxisLabel: t('weight-for-age-d3js-chart-options.x-axis-label-week'),
            yAxisLabel: t('weight-for-age-d3js-chart-options.y-axis-label-weight'),
            showGrid: true,
            showLegend: true,
            dateOfBirth: weightForAgeEvaluationRequest.dateOfBirth,
            currentWeight: weightForAgeEvaluationRequest.weight,
        }
    }
    if (data.type === WeightForAgeType.Height) {
        return {
            data: data,
            title: t('weight-for-age-d3js-chart-options.title-month'),
            subtitle: undefined,
            xAxisLabel: t('weight-for-age-d3js-chart-options.x-axis-label-month'),
            yAxisLabel: t('weight-for-age-d3js-chart-options.y-axis-label-weight'),
            showGrid: true,
            showLegend: true,
            dateOfBirth: weightForAgeEvaluationRequest.dateOfBirth,
            currentWeight: weightForAgeEvaluationRequest.weight,
        }
    }
})