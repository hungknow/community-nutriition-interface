import { useCallback } from "react"
import { weightEvaluationRequestAtom, weightStatusAtom } from "../atoms/weight-evaluation-atom" //"@/atoms/weight-evaluation-atom"
import { WeightLengthForm, WeightLengthFormData } from "./weight-length-form"
import { useAtomState, useAtomValue } from "@zedux/react"
import { WeightLengthHeightEvaluationResult } from "./weight-length-height-evaluation-result"
import { lengthOrHeightEvaluationRequestAtom } from "@/atoms/length-height-evaluation-atom"

export const WeightOrLengthOrHeightForAgeEvaluation = () => {
    const [, setWeightEvaluationRequest] = useAtomState(weightEvaluationRequestAtom)
    const [, setLengthOrHeightEvaluationRequest] = useAtomState(lengthOrHeightEvaluationRequestAtom)

    const weightStatusResult = useAtomValue(weightStatusAtom)

    const onSubmit = useCallback((data: WeightLengthFormData) => {
        setWeightEvaluationRequest({
            weight: data.weight,
            length: data.length,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender
        })
        setLengthOrHeightEvaluationRequest({
            lengthOrHeight: data.length,
            weight: data.weight,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender
        })
    }, [setWeightEvaluationRequest])

    return (
        <div className="flex flex-col">
            <WeightLengthForm onSubmit={onSubmit} />
            {weightStatusResult?.isOk && <WeightLengthHeightEvaluationResult />}
            {weightStatusResult?.isErr && <div>Error: {weightStatusResult.error.message}</div>}
        </div>
    )
}