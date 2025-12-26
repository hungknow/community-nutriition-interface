export enum Gender {
    Male = "male",
    Female = "female"
}

export interface WeightForLength {
    length: number;
    l: number;
    m: number;
    s: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd0: number;
    sd1: number;
    sd2: number;
    sd3: number;
}

export enum WeightForLengthEvalulationStatus {
    BelowSd3Neg = "below-sd3-neg",
    BetweenSd3NegAndSd2Neg = "between-sd3-neg-and-sd2-neg",
    BetweenSd2NegAndSd1Neg = "between-sd2-neg-and-sd1-neg",
    BetweenSd1NegAndSd0 = "between-sd1-neg-and-sd0",
    BetweenSd0AndSd1 = "between-sd0-and-sd1",
    BetweenSd1AndSd2 = "between-sd1-and-sd2",
    BetweenSd2AndSd3 = "between-sd2-and-sd3",
    AboveSd3 = "above-sd3",
}

export enum LengthOrHeightForAgeType {
    Length = "length",
    Height = "height"
}

// Used for child under 13 weeks
export interface LengthForAge {
    week: number;
    l: number;
    m: number;
    s: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd0: number;
    sd1: number;
    sd2: number;
    sd3: number;
}

// For the child over 13 weeks
export interface HeightForAge {
    month: number;
    l: number;
    m: number;
    s: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd0: number;
    sd1: number;
    sd2: number;
    sd3: number;
}

export enum LengthHeightForAgeEvalulationStatus {
    BelowSd3Neg = "below-sd3-neg",
    BetweenSd3NegAndSd2Neg = "between-sd3-neg-and-sd2-neg",
    BetweenSd2NegAndSd1Neg = "between-sd2-neg-and-sd1-neg",
    BetweenSd1NegAndSd0 = "between-sd1-neg-and-sd0",
    BetweenSd0AndSd1 = "between-sd0-and-sd1",
    BetweenSd1AndSd2 = "between-sd1-and-sd2",
    BetweenSd2AndSd3 = "between-sd2-and-sd3",
    AboveSd3 = "above-sd3",
}

export enum WeightForAgeType {
    Length = "length",
    Height = "height"
}

export interface WeightForAgeByWeek {
    week: number;
    l: number;
    m: number;
    s: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd0: number;
    sd1: number;
    sd2: number;
    sd3: number;
}

export interface WeightForAgeByMonth {
    month: number;
    l: number;
    m: number;
    s: number;
    sd3neg: number;
    sd2neg: number;
    sd1neg: number;
    sd0: number;
    sd1: number;
    sd2: number;
    sd3: number;
}

export type WeightForAgeDataset =
    | { type: WeightForAgeType.Length; data: WeightForAgeByWeek[] }
    | { type: WeightForAgeType.Height; data: WeightForAgeByMonth[] };

export interface GetWeightForAgeParams {
    dateOfBirth: Date;
    gender: Gender;
}