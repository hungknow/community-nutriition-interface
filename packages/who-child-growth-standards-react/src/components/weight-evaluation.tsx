import { useCallback } from "react"
import { weightEvaluationRequestAtom, weightStatusAtom } from "../atoms/weight-evaluation-atom" //"@/atoms/weight-evaluation-atom"
import { WeightLengthForm, WeightLengthFormData } from "./weight-length-form"
import { useAtomState, useAtomValue } from "@zedux/react"
import { WeightEvaluationResult } from "./weight-evaluation-result"

export const WeightEvaluation = () => {
    const [, setWeightEvaluationRequest] = useAtomState(weightEvaluationRequestAtom)
    const weightStatusResult = useAtomValue(weightStatusAtom)

    const onSubmit = useCallback((data: WeightLengthFormData) => {
        setWeightEvaluationRequest({
            weight: data.weight,
            length: data.length,
            birthdate: data.birthdate,
            gender: data.gender
        })
    }, [setWeightEvaluationRequest])

    return (
        <div className="flex flex-col">
            <WeightLengthForm onSubmit={onSubmit} />
            {weightStatusResult?.isOk && <WeightEvaluationResult />}
            {weightStatusResult?.isErr && <div>Error: {weightStatusResult.error.message}</div>}
        </div>
    )
}