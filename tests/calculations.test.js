import { describe, it } from 'vitest';
import defaultFormula from '../src/formulas/default.js';
import { computeGrandTotal, computeResult, getGradeLabel } from '../src/calculator.js';
import { cases, grandTotalCases } from './cases.js';
import { compareOutcome } from './compareOutcome.js';

describe('inclusion calculations', () => {
  it.each(cases)('$name', ({ name, values, expected }) => {
    const { result, error } = computeResult(defaultFormula, values);
    if (error) {
      throw new Error(`${name}\n  expected: calculation\n  actual:   ${error}`);
    }

    compareOutcome({
      name,
      actualScore: result,
      actualGrade: getGradeLabel(defaultFormula, result),
      expected,
    });
  });
});

describe('grand totals', () => {
  it.each(grandTotalCases)('$name', ({ name, lines, expected }) => {
    const scores = [];

    for (const [index, values] of lines.entries()) {
      const { result, error } = computeResult(defaultFormula, values);
      if (error) {
        throw new Error(`${name} (line ${index + 1})\n  expected: calculation\n  actual:   ${error}`);
      }
      scores.push(result);
    }

    const { result, error } = computeGrandTotal(defaultFormula, scores);
    if (error) {
      throw new Error(`${name}\n  expected: grand total\n  actual:   ${error}`);
    }

    compareOutcome({
      name,
      actualScore: result,
      actualGrade: getGradeLabel(defaultFormula, result),
      expected,
    });
  });
});
