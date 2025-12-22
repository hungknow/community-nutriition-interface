import { calculateMonthsSinceBirth } from "./math"
import { Gender } from "./types"
import { weightForLengthBoyBirthTo2Years, weightForLengthGirlBirthTo2Years } from "./weight-for-length-0-to-2-years"
import { weightForLengthBoy2To5Years, weightForLengthGirl2To5Years } from "./weight-for-length-2-to-5-years"
import { WeightForLengthEvalulationStatus, WeightForLength } from "./weight-for-length.types"

export function getWeightForLengthByBirthDate(birthDate: Date, gender: Gender): WeightForLength[] | undefined {
  const age = calculateMonthsSinceBirth(birthDate)
  // 2 years in months
  if (age <= 24 && gender === Gender.Female) {
    return weightForLengthGirlBirthTo2Years
  } else if (age <= 60 && gender === Gender.Female) {
    return weightForLengthGirl2To5Years
  } else if (age <= 24 && gender === Gender.Male) {
    return weightForLengthBoyBirthTo2Years
  } else if (age <= 60 && gender === Gender.Male) {
    return weightForLengthBoy2To5Years
  }
  return undefined
}

/**
 * Calculates Z-score from weight using the WHO LMS (Lambda-Mu-Sigma) method
 * 
 * This is the inverse of calculateWeightFromLMS - given a weight measurement,
 * it calculates the corresponding z-score.
 * 
 * Formula:
 * - If L != 0: Z = ((X/M)^L - 1) / (L * S)
 * - If L == 0: Z = ln(X/M) / S
 * 
 * Where:
 * - X = observed weight measurement (kg)
 * - M = median (Mu) parameter
 * - L = lambda parameter (Box-Cox transformation)
 * - S = sigma parameter (coefficient of variation)
 * - Z = z-score
 * 
 * @param l - Lambda parameter (Box-Cox power transformation)
 * @param m - Mu parameter (median value)
 * @param s - Sigma parameter (coefficient of variation)
 * @param weight - Observed weight in kg
 * @returns Z-score value
 */
export function calculateZScoreFromLMS(
  l: number,
  m: number,
  s: number,
  weight: number
): number {
  // Handle the case when L (lambda) is 0 or very close to 0
  // Use logarithmic transformation: Z = ln(X/M) / S
  if (Math.abs(l) < 1e-10) {
    return Math.log(weight / m) / s;
  }

  // Standard LMS formula: Z = ((X/M)^L - 1) / (L * S)
  const ratio = weight / m;

  // Check for invalid values (negative or zero weight/ratio)
  if (ratio <= 0) {
    return NaN;
  }

  // Calculate z-score using LMS formula
  const powered = Math.pow(ratio, l);
  return (powered - 1) / (l * s);
}

/**
* Finds the WeightForLength entry for a given length
* Returns the closest match or interpolates between two entries if needed
*/
function findWeightForLengthEntry(
  length: number,
  data: WeightForLength[]
): WeightForLength | null {
  if (!data || data.length === 0) {
    return null;
  }

  // Find exact match
  const exactMatch = data.find(d => d.length === length);
  if (exactMatch) {
    return exactMatch;
  }

  // Find closest entries for interpolation
  let lower: WeightForLength | null = null;
  let upper: WeightForLength | null = null;

  for (const entry of data) {
    if (entry.length < length) {
      lower = entry;
    } else if (entry.length > length && !upper) {
      upper = entry;
      break;
    }
  }

  // If we have both lower and upper, interpolate
  if (lower && upper) {
    const ratio = (length - lower.length) / (upper.length - lower.length);

    // Interpolate LMS parameters
    const l = lower.l + (upper.l - lower.l) * ratio;
    const m = lower.m + (upper.m - lower.m) * ratio;
    const s = lower.s + (upper.s - lower.s) * ratio;

    // Interpolate sd values
    const sd3neg = lower.sd3neg + (upper.sd3neg - lower.sd3neg) * ratio;
    const sd2neg = lower.sd2neg + (upper.sd2neg - lower.sd2neg) * ratio;
    const sd1neg = lower.sd1neg + (upper.sd1neg - lower.sd1neg) * ratio;
    const sd0 = lower.sd0 + (upper.sd0 - lower.sd0) * ratio;
    const sd1 = lower.sd1 + (upper.sd1 - lower.sd1) * ratio;
    const sd2 = lower.sd2 + (upper.sd2 - lower.sd2) * ratio;
    const sd3 = lower.sd3 + (upper.sd3 - lower.sd3) * ratio;

    return {
      length,
      l,
      m,
      s,
      sd3neg,
      sd2neg,
      sd1neg,
      sd0,
      sd1,
      sd2,
      sd3,
    };
  }

  // Return the closest match (lower or upper)
  return lower || upper;
}

/**
* Evaluates weight against WHO growth standards and returns the evaluation status
* 
* This function:
* 1. Finds the appropriate WeightForLength entry for the given length
* 2. Calculates the Z-score from the weight using LMS method
* 3. Compares the weight with sdXX values to determine the evaluation status
* 
* @param weight - Observed weight in kg
* @param length - Length/height in cm
* @param value - Array of WeightForLength data points
* @returns WeightEvaluationStatus indicating which percentile range the weight falls into
* 
* @example
*
* import { WeightForLengthGirlBirthTo2Years } from "./weight-for-length-0-to-2-years";
* 
* const status = evaluateWeight(3.5, 50, WeightForLengthGirlBirthTo2Years);
* // Returns: WeightForLengthEvalulationStatus.BetweenSd0AndSd1 (or appropriate status)
*/
export function evaluateWeightForLength(weight: number, length: number, value: WeightForLength[]): WeightForLengthEvalulationStatus {
  // Find the appropriate entry for the given length
  const entry = findWeightForLengthEntry(length, value);
  if (!entry) {
    throw new Error(`No data found for length ${length}cm`);
  }
  // Compare weight with sdXX values to determine status
  // We compare directly with the weight values rather than z-score for accuracy
  if (weight < entry.sd3neg) {
    return WeightForLengthEvalulationStatus.BelowSd3Neg;
  } else if (weight < entry.sd2neg) {
    return WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg;
  } else if (weight < entry.sd1neg) {
    return WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg;
  } else if (weight < entry.sd0) {
    return WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0;
  } else if (weight < entry.sd1) {
    return WeightForLengthEvalulationStatus.BetweenSd0AndSd1;
  } else if (weight < entry.sd2) {
    return WeightForLengthEvalulationStatus.BetweenSd1AndSd2;
  } else if (weight < entry.sd3) {
    return WeightForLengthEvalulationStatus.BetweenSd2AndSd3;
  } else {
    return WeightForLengthEvalulationStatus.AboveSd3;
  }
}

export function evaluateWeightSinceBirth(weight: number, length: number, birthDate: Date, gender: Gender): WeightForLengthEvalulationStatus {
  const weightForLength = getWeightForLengthByBirthDate(birthDate, gender)
  if (!weightForLength) {
    throw new Error(`No data found for birth date ${birthDate} and gender ${gender}`)
  }
  return evaluateWeightForLength(weight, length, weightForLength)
}
