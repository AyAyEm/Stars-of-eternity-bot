/**
 * Filter an array into two arrays.
 *
 * Defined by the callbackFn, the first array will be with the true elements
 * and the second array will be with the false elements.
 *
 * @param {Array} array
 * @param {Function} callbackFn
 * @param {Object} thisArg
 * @return {[Array, Array]} A matrix with two arrays.
 */

export function biFilter<T>(array: T[], callbackFn: Function, thisArg?: any) {
  const [trueElements, falseElements]: [T[], T[]] = [[], []];
  for (let i = 0; i < array.length; i += 1) {
    const element = array[i];
    if (callbackFn.call(thisArg, element, i, array)) {
      trueElements.push(element);
    } else {
      falseElements.push(element);
    }
  }
  return [trueElements, falseElements];
}
