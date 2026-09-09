import { describe, expect, it } from 'vitest';
import defaultFormula from '../src/formulas/default.js';
import { getGradeLabel } from '../src/calculator.js';

const thresholds = [
  { score: 0, grade: 'FL' },
  { score: 0.99, grade: 'FL' },
  { score: 1, grade: 'VVS1' },
  { score: 1.99, grade: 'VVS1' },
  { score: 2, grade: 'VVS2' },
  { score: 2.99, grade: 'VVS2' },
  { score: 3, grade: 'VS1' },
  { score: 3.99, grade: 'VS1' },
  { score: 4, grade: 'VS2' },
  { score: 4.99, grade: 'VS2' },
  { score: 5, grade: 'SI1' },
  { score: 5.99, grade: 'SI1' },
  { score: 6, grade: 'SI2' },
  { score: 6.99, grade: 'SI2' },
  { score: 7, grade: 'SI3' },
  { score: 7.99, grade: 'SI3' },
  { score: 8, grade: 'I1' },
  { score: 8.99, grade: 'I1' },
  { score: 9, grade: 'I2' },
  { score: 9.99, grade: 'I2' },
  { score: 10, grade: 'I3' },
  { score: 10.99, grade: 'I3' },
  { score: 11, grade: 'Reject' },
  { score: 12, grade: 'Reject' },
];

describe('getGradeLabel', () => {
  it.each(thresholds)('$score → $grade', ({ score, grade }) => {
    expect(getGradeLabel(defaultFormula, score)).toBe(grade);
  });
});
