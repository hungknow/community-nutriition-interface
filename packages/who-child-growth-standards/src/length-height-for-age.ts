import { lengthForAgeBoy0To13Weeks, lengthForAgeGirl0To13Weeks } from "./length-for-age-0-to-13-weeks"
import { heightForAgeBoy0To2Years, heightForAgeGirl0To2Years } from "./height-for-age-0-to-2-years"
import { heightForAgeBoy2To5Years, heightForAgeGirl2To5Years } from "./height-for-age-2-to-5-years"
import { calculateMonthsSinceBirth, calculateWeeksBetweenDates } from "./math"
import { Gender, HeighthForAge, LengthForAge, LengthHeightForAgeEvalulationStatus } from "./types"

export function getLengthForAge(birthDate: Date, gender: Gender): LengthForAge[] | undefined {
    const age = calculateMonthsSinceBirth(birthDate)
    if (age <= 13 && gender === Gender.Female) {
        return lengthForAgeGirl0To13Weeks
    } else if (age <= 13 && gender === Gender.Male) {
        return lengthForAgeBoy0To13Weeks
    }
    return undefined
}

export function getHeightForAge(birthDate: Date, gender: Gender): HeighthForAge[] | undefined {
    const age = calculateMonthsSinceBirth(birthDate)
    if (age <= 24 && gender === Gender.Female) {
        return heightForAgeGirl0To2Years
    } else if (age <= 24 && gender === Gender.Male) {
        return heightForAgeBoy0To2Years
    } else if (age <= 60 && gender === Gender.Female) {
        return heightForAgeGirl2To5Years
    } else if (age <= 60 && gender === Gender.Male) {
        return heightForAgeBoy2To5Years
    }
    return undefined
}

export function findLengthForAgeEntry(birthDate: Date, lengthForAge: LengthForAge[]): LengthForAge | undefined {
    const weeks = calculateWeeksBetweenDates(birthDate, new Date())
    return lengthForAge.find(entry => entry.week === weeks)
}

export function findHeightForAgeEntry(birthDate: Date, heightForAge: HeighthForAge[]): HeighthForAge | undefined {
    const months = calculateMonthsSinceBirth(birthDate)
    return heightForAge.find(entry => entry.month === months)
}

export function evaluateLengthForAgeEntry(length: number, entry: LengthForAge): LengthHeightForAgeEvalulationStatus {
    if (length < entry.sd3neg) {
        return LengthHeightForAgeEvalulationStatus.BelowSd3Neg;
    }
    if (length < entry.sd2neg) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd3NegAndSd2Neg;
    }
    if (length < entry.sd1neg) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd2NegAndSd1Neg;
    }
    if (length < entry.sd0) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd1NegAndSd0;
    }
    if (length < entry.sd1) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd0AndSd1;
    }
    if (length < entry.sd2) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd1AndSd2;
    }
    if (length < entry.sd3) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd2AndSd3;
    }
    return LengthHeightForAgeEvalulationStatus.AboveSd3;
}

export function evaluateHeightForAgeEntry(height: number, entry: HeighthForAge): LengthHeightForAgeEvalulationStatus {
    if (height < entry.sd3neg) {
        return LengthHeightForAgeEvalulationStatus.BelowSd3Neg;
    }
    if (height < entry.sd2neg) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd3NegAndSd2Neg;
    }
    if (height < entry.sd1neg) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd2NegAndSd1Neg;
    }
    if (height < entry.sd0) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd1NegAndSd0;
    }
    if (height < entry.sd1) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd0AndSd1;
    }
    if (height < entry.sd2) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd1AndSd2;
    }
    if (height < entry.sd3) {
        return LengthHeightForAgeEvalulationStatus.BetweenSd2AndSd3;
    }
    return LengthHeightForAgeEvalulationStatus.AboveSd3;
}

export function evaluateLengthForAge(length: number, birthDate: Date, lengthForAge: LengthForAge[]): LengthHeightForAgeEvalulationStatus {
    const lengthForAgeEntry = findLengthForAgeEntry(birthDate, lengthForAge)
    if (!lengthForAgeEntry) {
        throw new Error(`No data found for length ${length}cm`);
    }
    return evaluateLengthForAgeEntry(length, lengthForAgeEntry)
}

export function evaluateHeightForAge(height: number, birthDate: Date, heightForAge: HeighthForAge[]): LengthHeightForAgeEvalulationStatus {
    const heightForAgeEntry = findHeightForAgeEntry(birthDate, heightForAge)
    if (!heightForAgeEntry) {
        throw new Error(`No data found for height ${height}cm`);
    }
    return evaluateHeightForAgeEntry(height, heightForAgeEntry)
}

export function evaluateLengthHeightForAge(lengthOrHeight: number, birthDate: Date, gender: Gender): LengthHeightForAgeEvalulationStatus {
    const lengthForAge = getLengthForAge(birthDate, gender)
    const heightForAge = getHeightForAge(birthDate, gender)
    if (!lengthForAge && !heightForAge) {
        throw new Error(`No data found for the birth date ${birthDate} and the gender ${gender}`);
    }

    if (lengthForAge) {
        return evaluateLengthForAge(lengthOrHeight, birthDate, lengthForAge)
    }
    if (heightForAge) {
        return evaluateHeightForAge(lengthOrHeight, birthDate, heightForAge)
    }
    throw new Error(`No data found for the birth date ${birthDate} and the gender ${gender}`);
}
