import { t } from "@/i18n/i18n-functions"
import { WeightForLengthEvalulationStatus } from "who-child-growth-standards"

interface WeightLengthStatusProps {
    status: WeightForLengthEvalulationStatus
}

export const WeightLengthStatus = ({ status }: WeightLengthStatusProps) => {    
    let statusText = ""
    switch (status) {
        case WeightForLengthEvalulationStatus.BelowSd3Neg:
            statusText = t('weight-length-status.below-sd3-neg')
            break
        case WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg:
            statusText = t('weight-length-status.between-sd3-neg-and-sd2-neg')
            break
        case WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg:
            statusText = t('weight-length-status.between-sd2-neg-and-sd1-neg')
            break
        case WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0:
            statusText = t('weight-length-status.between-sd1-neg-and-sd0')
            break
        case WeightForLengthEvalulationStatus.BetweenSd0AndSd1:
            statusText = t('weight-length-status.between-sd0-and-sd1')
            break
        case WeightForLengthEvalulationStatus.BetweenSd1AndSd2:
            statusText = t('weight-length-status.between-sd1-and-sd2')
        case WeightForLengthEvalulationStatus.BetweenSd2AndSd3:
            statusText = t('weight-length-status.between-sd2-and-sd3')
            break
        case WeightForLengthEvalulationStatus.AboveSd3:
            statusText = t('weight-length-status.above-sd3')
    }

    return (
        <div className="flex flex-row gap-2">
            <span className="text-lg">{t('weight-length-status.title')}:</span>
            <span className="text-lg font-bold">{statusText}</span>
        </div>
    )
}