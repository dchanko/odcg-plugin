function parseFieldValue(field, rawValue) {
  if (rawValue === '' || rawValue == null) {
    return { value: null, error: null };
  }

  if (field.type === 'number') {
    const num = Number(rawValue);
    if (Number.isNaN(num)) {
      return { value: null, error: `${field.label} must be a number.` };
    }
    if (field.min != null && num < field.min) {
      return { value: null, error: `${field.label} must be at least ${field.min}.` };
    }
    if (field.max != null && num > field.max) {
      return { value: null, error: `${field.label} must be at most ${field.max}.` };
    }
    return { value: num, error: null };
  }

  if (field.type === 'select') {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      return { value: null, error: `${field.label} has no options configured.` };
    }
    const match = field.options.find((opt) => String(opt.value) === String(rawValue));
    if (!match) {
      return { value: null, error: `${field.label} has an invalid selection.` };
    }
    const value = field.valueType === 'number' ? Number(match.value) : String(match.value);
    return { value, error: null };
  }

  return { value: String(rawValue), error: null };
}

export function validateFields(formula, rawValues) {
  const values = {};
  const errors = [];

  for (const field of formula.fields) {
    const { value, error } = parseFieldValue(field, rawValues[field.name]);
    if (error) {
      errors.push(error);
      continue;
    }
    if (value === null) {
      errors.push(`${field.label} is required.`);
      continue;
    }
    values[field.name] = value;
  }

  return { values, errors, valid: errors.length === 0 };
}

export function computeResult(formula, values) {
  try {
    const result = formula.compute(values);
    if (result == null || Number.isNaN(result)) {
      return { result: null, error: 'Unable to compute a valid result.' };
    }
    return { result, error: null };
  } catch {
    return { result: null, error: 'An error occurred while calculating.' };
  }
}

export function formatResult(formula, result) {
  if (formula.formatResult) {
    return formula.formatResult(result);
  }
  return String(result);
}

export function computeGrandTotal(formula, validResults) {
  if (validResults.length === 0) {
    return { result: null, error: null };
  }

  if (typeof formula.aggregateResults !== 'function') {
    return {
      result: validResults.reduce((sum, n) => sum + n, 0),
      error: null,
    };
  }

  try {
    const result = formula.aggregateResults(validResults);
    if (result == null || Number.isNaN(result) || !Number.isFinite(result)) {
      return { result: null, error: 'Unable to compute grand total.' };
    }
    return { result, error: null };
  } catch {
    return { result: null, error: 'Unable to compute grand total.' };
  }
}

export function formatGrandTotal(formula, result) {
  const formatter = formula.formatGrandTotal ?? formula.formatResult;
  return formatter ? formatter(result) : String(result);
}

export function getGradeLabel(formula, value) {
  const ranges = formula.gradeRanges;
  if (!ranges?.length) return null;
  for (const range of ranges) {
    if (value < range.max) return range.label;
  }
  return formula.fallbackGrade ?? ranges[ranges.length - 1].label;
}

export function formatValueDisplay(formula, value, formatter) {
  const formatted = formatter ? formatter(value) : String(value);
  const grade = getGradeLabel(formula, value);
  return grade ? `${formatted} (${grade})` : formatted;
}

export function formatResultDisplay(formula, value) {
  const formatter = formula.formatResult ?? null;
  return formatValueDisplay(formula, value, formatter);
}

export function formatGrandTotalDisplay(formula, value) {
  const formatter = formula.formatGrandTotal ?? formula.formatResult ?? null;
  return formatValueDisplay(formula, value, formatter);
}

export function applyFieldOverrides(formula, overrides) {
  if (!overrides || Object.keys(overrides).length === 0) {
    return formula;
  }

  const fields = formula.fields.map((field) => {
    const override = overrides[field.name];
    if (!override) return field;

    const updated = { ...field };
    if (override.label != null) updated.label = override.label;
    if (override.default != null) updated.default = override.default;
    if (override.min != null) updated.min = Number(override.min);
    if (override.max != null) updated.max = Number(override.max);
    if (override.step != null) updated.step = Number(override.step);
    return updated;
  });

  return { ...formula, fields };
}

export function parseFieldOverrides(dataset) {
  const overrides = {};
  const prefix = 'field';

  for (const [key, value] of Object.entries(dataset)) {
    const match = key.match(/^field([A-Z][a-zA-Z]*)$/);
    if (!match) continue;

    const fieldName = match[1].charAt(0).toLowerCase() + match[1].slice(1);
    const propMatch = value.match(/^([^:]+):(.+)$/);
    if (!propMatch) continue;

    const prop = propMatch[1].trim();
    const propValue = propMatch[2].trim();
    overrides[fieldName] = overrides[fieldName] ?? {};
    overrides[fieldName][prop] = propValue;
  }

  return overrides;
}
