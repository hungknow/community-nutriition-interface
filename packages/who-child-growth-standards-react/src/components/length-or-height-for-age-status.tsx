import { t } from "@/i18n/i18n-functions"
import { LengthHeightForAgeEvalulationStatus } from "who-child-growth-standards"

interface LengthOrHeightForAgeStatusProps {
    status: LengthHeightForAgeEvalulationStatus
}

export const LengthOrHeightForAgeStatus = ({ status }: LengthOrHeightForAgeStatusProps) => {    
    let statusText = ""
    switch (status) {
        case LengthHeightForAgeEvalulationStatus.BelowSd3Neg:
            statusText = t('length-or-height-for-age-status.below-sd3-neg')
            break
        case LengthHeightForAgeEvalulationStatus.BetweenSd3NegAndSd2Neg:
            statusText = t('length-or-height-for-age-status.between-sd3-neg-and-sd2-neg')
            break
        case LengthHeightForAgeEvalulationStatus.BetweenSd2NegAndSd1Neg:
            statusText = t('length-or-height-for-age-status.between-sd2-neg-and-sd1-neg')
            break
        case LengthHeightForAgeEvalulationStatus.BetweenSd1NegAndSd0:
            statusText = t('length-or-height-for-age-status.between-sd1-neg-and-sd0')
            break
        case LengthHeightForAgeEvalulationStatus.BetweenSd0AndSd1:
            statusText = t('length-or-height-for-age-status.between-sd0-and-sd1')
            break
        case LengthHeightForAgeEvalulationStatus.BetweenSd1AndSd2:
            statusText = t('length-or-height-for-age-status.between-sd1-and-sd2')
        case LengthHeightForAgeEvalulationStatus.BetweenSd2AndSd3:
            statusText = t('length-or-height-for-age-status.between-sd2-and-sd3')
            break
        case LengthHeightForAgeEvalulationStatus.AboveSd3:
            statusText = t('length-or-height-for-age-status.above-sd3')
    }

    return (
        <div className="flex flex-row gap-2">
            <span className="text-lg">{t('length-or-height-for-age-status.title')}:</span>
            <span className="text-lg font-bold">{statusText}</span>
        </div>
    )
}