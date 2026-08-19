# ODCG Calculation Reference

This document describes the inputs and scoring logic for the **Objective Diamond Clarity Grading Calculator**. It is written for graders and reviewers — not developers.

## Overview

The calculator rates individual **inclusions** within a diamond and combines them into an overall **Diamond Clarity Rating**. You enter diamond-level details once, then add one row per inclusion. Each inclusion receives a numeric score and a clarity grade; the grand total is the sum of all valid inclusion scores, also mapped to a grade.

## Inputs

### Diamond Details (entered once)

These apply to every inclusion in the calculation.

| Field | Unit | Description |
|-------|------|-------------|
| Diamond Height | mm | Overall height of the stone |
| Diamond Width | mm | Overall width of the stone |

### Inclusion (one row per inclusion)

| Field | Unit / Type | Description |
|-------|-------------|-------------|
| Height | μm | Height of the inclusion |
| Width | μm | Width of the inclusion |
| Contrast | slider (−1 to 1) | How visibly the inclusion contrasts under overhead lighting |
| Position | dropdown (1–4) | Where the inclusion sits within the stone |

#### Contrast levels

The slider runs from −1 to +1 in steps of 0.1. The description shown reflects the nearest defined level:

| Value | Description |
|-------|-------------|
| −2 | Low contrast; difficult to observe with overhead lighting; e.g. a "cloud". |
| −1 | In between a cloud and typical crystals and feathers. |
| 0 | Typical contrast of a clear or white crystal or feather as seen with overhead lighting. |
| 0.5 | A more solid white or darker than usual crystal or feather between typical and high contrast. |
| 1 | High contrast with overhead lighting; black on a light background or a bright reflector on a dark background. |

#### Position options

| Value | Description |
|-------|-------------|
| 1 | Inside the table or outside the table within the length of the star facet. |
| 2 | Outside the length of the star facet from the table and in the inner half of the girdle and main facets. |
| 3 | In the outer half of the main and girdle facets. |
| 4 | Touching or almost touching the girdle. |

## Per-inclusion calculation

Each inclusion is scored through the following steps.

### Step 1 — Large-diamond scaling (conditional)

For diamonds larger than one carat, very large inclusions may be scaled down before scoring.

1. **Diamond area** = Diamond Height × Diamond Width (mm²)
2. **One-carat reference area** = 6.5 × 6.5 = 42.25 mm²
3. **Inclusion area** = Inclusion Height × Inclusion Width (μm²)
4. **10% threshold** = Diamond area × 0.1

Scaling applies when **both** are true:

- Diamond area is greater than the one-carat reference area
- Inclusion area exceeds 10% of the diamond area

When scaling applies:

```
scalingFactor = √(oneCaratArea) / √(diamondArea)
scaledHeight  = inclusionHeight × scalingFactor
scaledWidth   = inclusionWidth × scalingFactor
```

Otherwise, scaled dimensions equal the entered height and width.

### Step 2 — Base score

```
baseScore = log₂( √(scaledHeight × scaledWidth) / 25 )
```

This derives a size-based score from the (possibly scaled) inclusion dimensions.

### Step 3 — Contrast adjustment

```
score = baseScore + contrast
```

The contrast value (−1 to +1) is added directly to the base score.

### Step 4 — Position penalties

Position adjusts the score based on where the inclusion sits in the stone. Penalties depend on the score **at the time each rule is applied**. When a more peripheral location is selected, penalties from inner locations may also apply in sequence (cumulative).

#### Inside the table or outside the table within the length of the star facet

No position penalty is applied.

#### Outside the length of the star facet from the table and in the inner half of the girdle and main facets

All of the following penalty tiers are applied in sequence:

1. **Inner half of girdle and main facets** (this location): −0.25 if score < 5
2. **Outer half of main and girdle facets**: −0.50 if score < 5; −0.25 if 5 ≤ score < 6
3. **Touching or almost touching the girdle**: −1.00 if score < 5; −0.50 if 5 ≤ score < 6

#### In the outer half of the main and girdle facets

The following penalty tiers are applied in sequence:

1. **Outer half of main and girdle facets** (this location): −0.50 if score < 5; −0.25 if 5 ≤ score < 6
2. **Touching or almost touching the girdle**: −1.00 if score < 5; −0.50 if 5 ≤ score < 6

#### Touching or almost touching the girdle

Only the girdle-tier penalty applies:

- −1.00 if score < 5
- −0.50 if 5 ≤ score < 6

### Step 5 — Floor

```
finalScore = max(score, 0)
```

Negative scores are raised to zero. The result is displayed to two decimal places.

### Step 6 — Grade label

The numeric score is mapped to a clarity grade (see table below). Display format:

```
{score} ({grade})
```

Example: `2.35 (VVS2)`

## Grade mapping

The first row where **score < threshold** determines the grade:

| Score range | Grade |
|-------------|-------|
| < 1 | FL |
| < 2 | VVS1 |
| < 3 | VVS2 |
| < 4 | VS1 |
| < 5 | VS2 |
| < 6 | SI1 |
| < 7 | SI2 |
| < 8 | SI3 |
| < 9 | I1 |
| < 10 | I2 |
| < 11 | I3 |
| ≥ 11 | Reject |

Boundary note: a score of exactly 1.0 maps to **VVS1** (not FL), because the rule is score **<** threshold.

## Diamond Clarity Rating (grand total)

The **Diamond Clarity Rating** at the bottom of the calculator is the **sum** of all valid inclusion scores, displayed with the same grade mapping.

| Behavior | Detail |
|----------|--------|
| Valid inclusions | Included in the sum |
| Incomplete or invalid inclusions | Excluded; a warning shows *"Total based on X of Y lines"* |
| Invalid Diamond Details | All inclusion calculations are blocked until corrected |
| Display | Same `{score} ({grade})` format as individual inclusions |

## Quick reference — calculation flow

```
Diamond Details (height, width)
        +
Inclusion (height, width, contrast, position)
        ↓
  [Large-diamond scaling?]
        ↓
  baseScore = log₂(√(h×w) / 25)
        ↓
  score += contrast
        ↓
  position penalties (sequential)
        ↓
  finalScore = max(score, 0)
        ↓
  display: score (grade)
        ↓
Grand total = sum of all valid inclusion scores → grade
```
