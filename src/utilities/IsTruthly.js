/**
 * Check if all object properties are truthly. Not a strict check.
 * @param {Object.<string,boolean>} obj object to check
 * @returns {boolean} <b>true</b> when all properties are truthly,
 * otherwise false
 */
export const isTruthly = (obj) => {
  let allTrue = false;
  for (const key of Object.keys(obj)) {
    allTrue = obj[key];
    if (!obj[key]) {
      break;
    }
  }

  return allTrue;
};
