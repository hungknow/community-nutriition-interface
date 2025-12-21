import { atom, useAtomValue } from "@zedux/react";
import { evaluateWeightSinceBirth, Gender } from "who-child-growth-standards";

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
