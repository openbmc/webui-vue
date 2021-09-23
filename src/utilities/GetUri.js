const getFromObject = (obj) => obj['@odata.id'];

const getFirstFromArray = (arr) =>
  arr.length > 0 ? getFromObject(arr[0]) : undefined;

const getFromFunction = (fn) => {
  if (fn instanceof Function) {
    return fn();
  }

  return undefined;
};

/**
 * Gets uri from odata object
 * @param {Object | Function | Array} obj
 */
const getUri = (obj) => {
  let source = getFromFunction(obj) || obj || {};

  if (Array.isArray(source)) {
    return getFirstFromArray(source);
  }

  return getFromObject(source);
};

export default getUri;
