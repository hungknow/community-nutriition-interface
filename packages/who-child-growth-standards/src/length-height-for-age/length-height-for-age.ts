import { lengthForAgeBoy0To13Weeks, lengthForAgeGirl0To13Weeks } from "./length-for-age-0-to-13-weeks"
import { heightForAgeBoy0To2Years, heightForAgeGirl0To2Years } from "./height-for-age-0-to-2-years"
import { heightForAgeBoy2To5Years, heightForAgeGirl2To5Years } from "./height-for-age-2-to-5-years"
import { calculateMonthsSinceBirth, calculateWeeksBetweenDates } from "../math"
import { Gender, HeightForAge, LengthForAge, LengthHeightForAgeEvalulationStatus, LengthOrHeightForAgeType } from "../types"

export function getLengthOrHeightForAgeType(birthDate: Date): LengthOrHeightForAgeType {
    const weeks = calculateWeeksBetweenDates(birthDate, new Date())
    if (weeks <= 13) {
        return LengthOrHeightForAgeType.Length
    } else if (weeks <= 52) {
        return LengthOrHeightForAgeType.Height
    } else {
        throw new Error(`Age exceeds 5 years. Cannot evaluate length/height for age ${weeks} weeks (${Math.round(weeks / 52)} years)`);
    }
}

// ============================================================================
// Data Retrieval Functions
// ============================================================================

export function getLengthForAgeDataset(birthDate: Date, gender: Gender): LengthForAge[] | undefined {
    const age = calculateMonthsSinceBirth(birthDate)
    if (age <= 13 && gender === Gender.Female) {
        return lengthForAgeGirl0To13Weeks
    } else if (age <= 13 && gender === Gender.Male) {
        return lengthForAgeBoy0To13Weeks
    }
    return undefined
}

export function getHeightForAgeDataset(birthDate: Date, gender: Gender): HeightForAge[] | undefined {
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

export function getLengthOrHeightForAgeDataset(birthDate: Date, gender: Gender): { lengthForAge?: LengthForAge[], heightForAge?: HeightForAge[] } {
    const lengthForAge = getLengthForAgeDataset(birthDate, gender)
    if (lengthForAge) {
        return { lengthForAge }
    }
    const heightForAge = getHeightForAgeDataset(birthDate, gender)
    return { heightForAge }
}

// ============================================================================
// Entry Finder Functions
// ============================================================================

export function findLengthForAgeEntryByDateOfBirth(birthDate: Date, lengthForAge: LengthForAge[]): LengthForAge | undefined {
    const weeks = calculateWeeksBetweenDates(birthDate, new Date())
    return lengthForAge.find(entry => entry.week === weeks)
}

export function findHeightForAgeEntryByDateOfBirth(birthDate: Date, heightForAge: HeightForAge[]): HeightForAge | undefined {
    const months = calculateMonthsSinceBirth(birthDate)
    return heightForAge.find(entry => entry.month === months)
}

// ============================================================================
// Entry Evaluation Functions
// ============================================================================

export function evaluateLengthAgainstEntry(length: number, entry: LengthForAge): LengthHeightForAgeEvalulationStatus {
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

export function evaluateHeightAgainstEntry(height: number, entry: HeightForAge): LengthHeightForAgeEvalulationStatus {
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

// ============================================================================
// Full Evaluation Functions
// ============================================================================

export function evaluateLengthForAgeFromDataset(length: number, birthDate: Date, lengthForAge: LengthForAge[]): LengthHeightForAgeEvalulationStatus {
    const lengthForAgeEntry = findLengthForAgeEntryByDateOfBirth(birthDate, lengthForAge)
    if (!lengthForAgeEntry) {
        throw new Error(`No data found for length ${length}cm`);
    }
    return evaluateLengthAgainstEntry(length, lengthForAgeEntry)
}

export function evaluateHeightForAgeFromDataset(height: number, birthDate: Date, heightForAge: HeightForAge[]): LengthHeightForAgeEvalulationStatus {
    const heightForAgeEntry = findHeightForAgeEntryByDateOfBirth(birthDate, heightForAge)
    if (!heightForAgeEntry) {
        throw new Error(`No data found for height ${height}cm`);
    }
    return evaluateHeightAgainstEntry(height, heightForAgeEntry)
}

// ============================================================================
// Main Evaluation Function
// ============================================================================

export function evaluateLengthOrHeightForAge(lengthOrHeight: number, birthDate: Date, gender: Gender): LengthHeightForAgeEvalulationStatus {
    // First determine if we should evaluate by weeks (length) or months (height)
    const lengthOrHeightForAgeType = getLengthOrHeightForAgeType(birthDate)

    if (lengthOrHeightForAgeType == LengthOrHeightForAgeType.Length) {
        const lengthForAge = getLengthForAgeDataset(birthDate, gender)
        if (!lengthForAge) {
            throw new Error(`No length data found for the birth date ${birthDate} and the gender ${gender}`);
        }
        return evaluateLengthForAgeFromDataset(lengthOrHeight, birthDate, lengthForAge)
    } else {
        const heightForAge = getHeightForAgeDataset(birthDate, gender)
        if (!heightForAge) {
            throw new Error(`No height data found for the birth date ${birthDate} and the gender ${gender}`);
        }
        return evaluateHeightForAgeFromDataset(lengthOrHeight, birthDate, heightForAge)
    }
}
