/**
 * Filter an array into two arrays.
 *
 * Defined by the callbackFn, the first array will be with the true elements
 * and the second array will be with the false elements.
 *
 * @param {Array} array
 * @param {Function} callbackfn
 * @param {Object} thisArg
 * @return {[Array, Array]} A matrix with two arrays.
 */

function biFilter(array, callbackfn, thisArg = this) {
  const [trueElements, falseElements] = [[], []];
  for (let i = 0; i < array.length; i += 1) {
    const element = array[i];
    if (callbackfn.call(thisArg, element, i, array)) {
      trueElements.push(element);
    } else {
      falseElements.push(element);
    }
  }
  return [trueElements, falseElements];
}

module.exports = biFilter;
