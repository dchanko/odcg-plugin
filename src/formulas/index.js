import defaultFormula from './default.js';

const formulas = {
  default: defaultFormula,
};

export function getFormula(id) {
  return formulas[id] ?? formulas.default;
}

export function listFormulas() {
  return Object.keys(formulas);
}
