import { DAYS_IN_13_WEEKS, DAYS_IN_5_YEARS } from "../constants"
import { calculateDaysBetweenDates } from "../math"
import { Gender, GetWeightForAgeParams, WeightForAgeDataset, WeightForAgeType } from "../types"
import { weightForAgeBoy0To13Weeks, weightForAgeGirl0To13Weeks } from "./weight-for-age-0-to-13-weeks"
import { weightForAgeBoy0To5Years, weightForAgeGirl0To5Years } from "./weight-for-age-0-to-5-years"

export function getWeightForAgeDataset({ dateOfBirth, gender, dateOfEvaluation }: GetWeightForAgeParams): WeightForAgeDataset | undefined {
    const days = calculateDaysBetweenDates(dateOfBirth, dateOfEvaluation ?? new Date())
    if (days <= DAYS_IN_13_WEEKS && gender === Gender.Female) {
        return { type: WeightForAgeType.Length, data: weightForAgeGirl0To13Weeks }
    } else if (days <= DAYS_IN_5_YEARS && gender === Gender.Female) {
        return { type: WeightForAgeType.Height, data: weightForAgeGirl0To5Years }
    } else if (days <= DAYS_IN_13_WEEKS && gender === Gender.Male) {
        return { type: WeightForAgeType.Length, data: weightForAgeBoy0To13Weeks }
    } else if (days <= DAYS_IN_5_YEARS && gender === Gender.Male) {
        return { type: WeightForAgeType.Height, data: weightForAgeBoy0To5Years }
    }
    return undefined
}
