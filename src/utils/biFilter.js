module.exports = function biFilter(array, callbackfn, thisArg = this) {
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
};
