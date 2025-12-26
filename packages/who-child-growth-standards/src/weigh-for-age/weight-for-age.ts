import { calculateMonthsSinceBirth } from "../math"
import { Gender, GetWeightForAgeParams, WeightForAgeDataset, WeightForAgeType } from "../types"
import { weightForAgeBoy0To13Weeks, weightForAgeGirl0To13Weeks } from "./weight-for-age-0-to-13-weeks"
import { weightForAgeBoy0To5Years, weightForAgeGirl0To5Years } from "./weight-for-age-0-to-5-years"

export function getWeightForAgeDataset({ dateOfBirth, gender }: GetWeightForAgeParams): WeightForAgeDataset | undefined {
    const age = calculateMonthsSinceBirth(dateOfBirth)
    if (age <= 13 && gender === Gender.Female) {
        return { type: WeightForAgeType.Length, data: weightForAgeGirl0To13Weeks }
    } else if (age <= 5 && gender === Gender.Female) {
        return { type: WeightForAgeType.Height, data: weightForAgeGirl0To5Years }
    } else if (age <= 13 && gender === Gender.Male) {
        return { type: WeightForAgeType.Length, data: weightForAgeBoy0To13Weeks }
    } else if (age <= 5 && gender === Gender.Male) {
        return { type: WeightForAgeType.Height, data: weightForAgeBoy0To5Years }
    }
    return undefined
}
