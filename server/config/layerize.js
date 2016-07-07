module.exports = function (config) {
  const layzerized = {};
  Object.keys(config).forEach(key => {
    const keyPath = key.split('.');
    let current = layzerized;
    keyPath.some((path, index) => {
      if (index === keyPath.length - 1) {
        // Last segment
        current[path] = config[key];
        return true;
      }
      if (Object.prototype.toString.call(current[path]) !== '[object Object]') {
        if (typeof current[path] === 'undefined' || current[path]) {
          // Not assigned an object yet, or the value can be coerced to true
          current[path] = {};
        } else {
          // False value, breaking the loop
          return true;
        }
      }
      current = current[path];
      return false;
    });
  });
  return layzerized;
};
