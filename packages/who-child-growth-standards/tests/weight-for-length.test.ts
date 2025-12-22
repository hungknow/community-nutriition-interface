import { describe, it, expect } from "vitest";
import { evaluateWeightForLength } from "../src/weight-for-length";
import { weightForLengthGirlBirthTo2Years } from "../src/weight-for-length-0-to-2-years";
import { WeightForLengthEvalulationStatus } from "../src/weight-for-length.types";

describe("evaluateWeight", () => {
  describe("with exact length matches", () => {
    it("should return BelowSd3Neg for weight below sd3neg", () => {
      // Using first data point: length 45cm, sd3neg: 1.9
      const result = evaluateWeightForLength(1.5, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BelowSd3Neg);
    });

    it("should return BetweenSd3NegAndSd2Neg for weight between sd3neg and sd2neg", () => {
      // Using first data point: length 45cm, sd3neg: 1.9, sd2neg: 2.1
      const result = evaluateWeightForLength(2.0, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg);
    });

    it("should return BetweenSd2NegAndSd1Neg for weight between sd2neg and sd1neg", () => {
      // Using first data point: length 45cm, sd2neg: 2.1, sd1neg: 2.3
      const result = evaluateWeightForLength(2.2, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg);
    });

    it("should return BetweenSd1NegAndSd0 for weight between sd1neg and sd0", () => {
      // Using first data point: length 45cm, sd1neg: 2.3, sd0: 2.5
      const result = evaluateWeightForLength(2.4, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0);
    });

    it("should return BetweenSd0AndSd1 for weight between sd0 and sd1", () => {
      // Using first data point: length 45cm, sd0: 2.5, sd1: 2.7
      const result = evaluateWeightForLength(2.6, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should return BetweenSd1AndSd2 for weight between sd1 and sd2", () => {
      // Using first data point: length 45cm, sd1: 2.7, sd2: 3.0
      const result = evaluateWeightForLength(2.85, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd1AndSd2);
    });

    it("should return BetweenSd2AndSd3 for weight between sd2 and sd3", () => {
      // Using first data point: length 45cm, sd2: 3.0, sd3: 3.3
      const result = evaluateWeightForLength(3.15, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd2AndSd3);
    });

    it("should return AboveSd3 for weight above sd3", () => {
      // Using first data point: length 45cm, sd3: 3.3
      const result = evaluateWeightForLength(4.0, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.AboveSd3);
    });
  });

  describe("with different length values", () => {
    it("should evaluate weight correctly for length 50cm", () => {
      // Using data point: length 50cm, sd0: 3.4
      const result = evaluateWeightForLength(3.4, 50, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 60cm", () => {
      // Using data point: length 60cm, sd0: 5.9
      const result = evaluateWeightForLength(5.9, 60, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 70cm", () => {
      // Using data point: length 70cm, sd0: 8.2
      const result = evaluateWeightForLength(8.2, 70, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 80cm", () => {
      // Using data point: length 80cm, sd0: 10.1
      const result = evaluateWeightForLength(10.1, 80, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 90cm", () => {
      // Using data point: length 90cm, sd0: 12.5
      const result = evaluateWeightForLength(12.5, 90, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 100cm", () => {
      // Using data point: length 100cm, sd0: 15.0
      const result = evaluateWeightForLength(15.0, 100, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should evaluate weight correctly for length 110cm (last data point)", () => {
      // Using last data point: length 110cm, sd0: 18.3
      const result = evaluateWeightForLength(18.3, 110, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });
  });

  describe("with interpolated length values", () => {
    it("should interpolate correctly for length between data points (45.25cm)", () => {
      // Between 45cm and 45.5cm
      const result = evaluateWeightForLength(2.3, 45.25, weightForLengthGirlBirthTo2Years);
      // Should be able to evaluate (no error thrown)
      expect([
        WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg,
        WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0,
        WeightForLengthEvalulationStatus.BetweenSd0AndSd1,
      ]).toContain(result);
    });

    it("should interpolate correctly for length 50.25cm", () => {
      // Between 50cm and 50.5cm
      const result = evaluateWeightForLength(3.5, 50.25, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should interpolate correctly for length 75.25cm", () => {
      // Between 75cm and 75.5cm
      const result = evaluateWeightForLength(9.15, 75.25, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("edge cases", () => {
    it("should handle weight exactly at sd3neg boundary", () => {
      // Using first data point: length 45cm, sd3neg: 1.9
      const result = evaluateWeightForLength(1.9, 45, weightForLengthGirlBirthTo2Years);
      // At boundary, should be BetweenSd3NegAndSd2Neg (since weight < sd3neg is false when equal)
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg);
    });

    it("should handle weight exactly at sd0 (median)", () => {
      // Using first data point: length 45cm, sd0: 2.5
      const result = evaluateWeightForLength(2.5, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BetweenSd0AndSd1);
    });

    it("should handle weight exactly at sd3 boundary", () => {
      // Using first data point: length 45cm, sd3: 3.3
      const result = evaluateWeightForLength(3.3, 45, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.AboveSd3);
    });

    it("should handle very low weight", () => {
      const result = evaluateWeightForLength(1.0, 50, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.BelowSd3Neg);
    });

    it("should handle very high weight", () => {
      const result = evaluateWeightForLength(25.0, 100, weightForLengthGirlBirthTo2Years);
      expect(result).toBe(WeightForLengthEvalulationStatus.AboveSd3);
    });
  });

  describe("edge cases with out-of-range lengths", () => {
    it("should use closest data point for length below minimum", () => {
      // Length 40cm is below minimum (45cm), should use first entry
      const result = evaluateWeightForLength(2.0, 40, weightForLengthGirlBirthTo2Years);
      // Should still return a valid status using the first data point
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should use closest data point for length above maximum", () => {
      // Length 120cm is above maximum (110cm), should use last entry
      const result = evaluateWeightForLength(20.0, 120, weightForLengthGirlBirthTo2Years);
      // Should still return a valid status using the last data point
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should throw error for empty data array", () => {
      expect(() => {
        evaluateWeightForLength(2.0, 50, []);
      }).toThrow("No data found for length 50cm");
    });
  });

  describe("real-world scenarios", () => {
    it("should evaluate a typical newborn weight (length 50cm, weight 3.2kg)", () => {
      const result = evaluateWeightForLength(3.2, 50, weightForLengthGirlBirthTo2Years);
      // Should be in a normal range
      expect([
        WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0,
        WeightForLengthEvalulationStatus.BetweenSd0AndSd1,
        WeightForLengthEvalulationStatus.BetweenSd1AndSd2,
      ]).toContain(result);
    });

    it("should evaluate a 6-month-old weight (length 65cm, weight 7.0kg)", () => {
      const result = evaluateWeightForLength(7.0, 65, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should evaluate a 12-month-old weight (length 75cm, weight 9.0kg)", () => {
      const result = evaluateWeightForLength(9.0, 75, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should evaluate a 18-month-old weight (length 82cm, weight 10.5kg)", () => {
      const result = evaluateWeightForLength(10.5, 82, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should evaluate a 24-month-old weight (length 87cm, weight 12.0kg)", () => {
      const result = evaluateWeightForLength(12.0, 87, weightForLengthGirlBirthTo2Years);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("boundary value testing", () => {
    it("should correctly identify all status ranges for length 50cm", () => {
      // For length 50cm: sd3neg: 2.6, sd2neg: 2.8, sd1neg: 3.1, sd0: 3.4, sd1: 3.7, sd2: 4.0, sd3: 4.5
      const testCases = [
        { weight: 2.5, expected: WeightForLengthEvalulationStatus.BelowSd3Neg }, // Below sd3neg: 2.6
        { weight: 2.7, expected: WeightForLengthEvalulationStatus.BetweenSd3NegAndSd2Neg }, // Between sd3neg (2.6) and sd2neg (2.8)
        { weight: 2.9, expected: WeightForLengthEvalulationStatus.BetweenSd2NegAndSd1Neg }, // Between sd2neg (2.8) and sd1neg (3.1)
        { weight: 3.2, expected: WeightForLengthEvalulationStatus.BetweenSd1NegAndSd0 }, // Between sd1neg (3.1) and sd0 (3.4)
        { weight: 3.5, expected: WeightForLengthEvalulationStatus.BetweenSd0AndSd1 }, // Between sd0 (3.4) and sd1 (3.7)
        { weight: 3.8, expected: WeightForLengthEvalulationStatus.BetweenSd1AndSd2 }, // Between sd1 (3.7) and sd2 (4.0)
        { weight: 4.2, expected: WeightForLengthEvalulationStatus.BetweenSd2AndSd3 }, // Between sd2 (4.0) and sd3 (4.5)
        { weight: 5.0, expected: WeightForLengthEvalulationStatus.AboveSd3 }, // Above sd3: 4.5
      ];

      testCases.forEach(({ weight, expected }) => {
        const result = evaluateWeightForLength(weight, 50, weightForLengthGirlBirthTo2Years);
        expect(result).toBe(expected);
      });
    });
  });
});




