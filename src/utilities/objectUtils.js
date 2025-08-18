/**
 * Deeply merge two plain objects (or arrays) without mutating the inputs.
 *
 * Rules:
 * - Arrays from the source replace arrays on the target.
 * - Plain objects are merged recursively.
 * - Primitive values from the source overwrite the target.
 */
export function deepMerge(target, source) {
  if (typeof target !== 'object' || target === null) return source;
  if (typeof source !== 'object' || source === null) return target;
  const output = Array.isArray(target) ? target.slice() : { ...target };
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];
    if (Array.isArray(sourceValue)) {
      output[key] = sourceValue.slice();
    } else if (
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });
  return output;
}
