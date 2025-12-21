import { WeightLengthFormData } from "@/components/weight-length-form"
import { useCallback } from "react"

export const useWeightEvaluation = () => {
    const onReceiveData = useCallback((data: WeightLengthFormData) => {
    }, [])

    return {
        onReceiveData
    }
}