import { describe, expect, it } from 'vitest';
import defaultFormula from '../src/formulas/default.js';
import examples from '../src/formulas/examples.js';
import { computeGrandTotal, computeResult, getGradeLabel } from '../src/calculator.js';

function gradeFromLabel(label) {
  const match = String(label).match(/\(([^)]+)\)\s*$/);
  if (!match) {
    throw new Error(`label "${label}" must end with a grade in parentheses`);
  }
  return match[1];
}

describe('illustrative examples', () => {
  it('are attached to the default formula', () => {
    expect(defaultFormula.examples).toBe(examples);
    expect(examples.length).toBeGreaterThan(0);
  });

  it.each(examples)('$id has required fields and a matching grade', (example) => {
    expect(example.id).toBeTruthy();
    expect(example.label).toBeTruthy();
    expect(example.lines?.length).toBeGreaterThan(0);

    for (const field of defaultFormula.contextFields) {
      expect(example.context[field.name], `${example.id} context.${field.name}`).not.toBeUndefined();
    }

    const scores = [];
    for (const [index, line] of example.lines.entries()) {
      for (const field of defaultFormula.fields) {
        expect(line[field.name], `${example.id} line ${index + 1}.${field.name}`).not.toBeUndefined();
      }

      const merged = { ...example.context, ...line };
      const { result, error } = computeResult(defaultFormula, merged);
      if (error) {
        throw new Error(`${example.id} (line ${index + 1}): ${error}`);
      }
      scores.push(result);
    }

    const { result, error } = computeGrandTotal(defaultFormula, scores);
    if (error || result == null) {
      throw new Error(`${example.id}: ${error ?? 'no grand total'}`);
    }

    expect(gradeFromLabel(example.label)).toBe(getGradeLabel(defaultFormula, result));
  });
});
