exports.execute = async function (object, allowedProps = []) {
  await global.util.asyncForEach(allowedProps, async (prop) => {
    if (Array.isArray(object)) {
      const aux = [];
      await global.util.asyncForEach(object, async (obj) => {
        delete obj[prop];
        aux.push(obj);
      });
      object = aux;
    } else if (typeof object === 'object') {
      delete object[prop];
    }
  });
  return object;
};
