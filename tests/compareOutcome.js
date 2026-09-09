export function formatScore(value) {
  return Number(value).toFixed(2);
}

export function formatOutcome(score, grade) {
  const formatted = formatScore(score);
  return grade ? `${formatted} (${grade})` : formatted;
}

function formatExpected(expected) {
  const hasScore = expected.score != null;
  const hasGrade = expected.grade != null;

  if (hasScore && hasGrade) {
    return `${formatScore(expected.score)} (${expected.grade})`;
  }
  if (hasScore) return formatScore(expected.score);
  if (hasGrade) return expected.grade;
  return '(nothing specified)';
}

export function compareOutcome({ name, actualScore, actualGrade, expected }) {
  if (!expected || (expected.score == null && expected.grade == null)) {
    throw new Error(`${name}\n  case must specify expected.score and/or expected.grade`);
  }

  if (actualScore == null || Number.isNaN(actualScore)) {
    throw new Error(
      `${name}\n  expected: ${formatExpected(expected)}\n  actual:   (no score)\n  diff:     calculation did not produce a numeric score`,
    );
  }

  const hasExpectedScore = expected.score != null;
  const hasExpectedGrade = expected.grade != null;
  const formattedActual = formatScore(actualScore);
  const scoreDiffers = hasExpectedScore && formatScore(expected.score) !== formattedActual;
  const gradeDiffers = hasExpectedGrade && expected.grade !== actualGrade;

  if (!scoreDiffers && !gradeDiffers) return;

  const diffs = [];
  if (scoreDiffers) {
    diffs.push(`score ${formatScore(expected.score)} → ${formattedActual}`);
  }
  if (gradeDiffers) {
    diffs.push(`grade ${expected.grade} → ${actualGrade}`);
  }

  throw new Error(
    `${name}\n  expected: ${formatExpected(expected)}\n  actual:   ${formatOutcome(actualScore, actualGrade)}\n  diff:     ${diffs.join('\n  diff:     ')}`,
  );
}
