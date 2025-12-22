import { WeightForLengthEvalulationStatus } from "who-child-growth-standards"

interface WeightLengthStatusProps {
    status: WeightForLengthEvalulationStatus
}

export const WeightLengthStatus = ({ status }: WeightLengthStatusProps) => {
    let statusText = ""
    switch (status) {
        case WeightForLengthEvalulationStatus.BelowSd3Neg:
            statusText = "Below -3SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg:
            statusText = "Between -3SD and -2SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg:
            statusText = "Between -2SD and -1SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0:
            statusText = "Between -1SD and 0SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd0AndSd1:
            statusText = "Between 0SD and 1SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd1AndSd2:
            statusText = "Between 1SD and 2SD"
            break
        case WeightForLengthEvalulationStatus.BetweenSd2AndSd3:
            statusText = "Between 2SD and 3SD"
            break
        case WeightForLengthEvalulationStatus.AboveSd3:
            statusText = "Above 3SD"
    }

    return (
        <span>{statusText}</span>
    )
}