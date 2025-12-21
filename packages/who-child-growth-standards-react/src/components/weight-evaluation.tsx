import { weightEvaluationRequestAtom } from "@/atoms/weight-evaluation-atom"
import { WeightLengthForm, WeightLengthFormData } from "./weight-length-form"
import { useAtomState } from "@zedux/react"
import { useCallback } from "react"

export const WeightEvaluation = () => {
    const [, setWeightEvaluationRequest] = useAtomState(weightEvaluationRequestAtom)

    const onSubmit = useCallback((data: WeightLengthFormData) => {
        setWeightEvaluationRequest({
            weight: data.weight,
            length: data.length,
            birthdate: data.birthdate,
            gender: data.gender
        })
    }, [])

    return (
        <>
            <WeightLengthForm onSubmit={onSubmit} />

        </>
    )
}