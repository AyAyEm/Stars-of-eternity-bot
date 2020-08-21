/**
 * Filter an array into two arrays.
 *
 * Defined by the callbackFn, the first array will be with the truth elements
 * and the second array will be with the falsey elements.
 *
 * @param {Array} array
 * @param {Function} callbackfn
 * @param {Object} thisArg
 * @return {[Array, Array]} A matrix with two arrays.
 */

function biFilter(array, callbackfn, thisArg = this) {
  const [truthElements, falseyElements] = [[], []];
  for (let i = 0; i < array.length; i += 1) {
    const element = array[i];
    if (callbackfn.call(thisArg, element, i, array)) {
      truthElements.push(element);
    } else {
      falseyElements.push(element);
    }
  }
  return [truthElements, falseyElements];
}

module.exports = biFilter;
