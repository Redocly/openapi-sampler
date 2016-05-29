import { defaults } from './utils';

export function normalize(schema) {
  mergeAllOf(schema);
}

function mergeAllOf(schema) {
  traverse(schema);
};


function traverse(obj) {
  if (obj === null || typeof(obj) !== 'object') {
    return;
  }

  for(var key in obj) {
    if (obj.hasOwnProperty(key)) {
      traverse(obj[key]);
    }
  }

  if (obj.allOf) {
    merge(obj, obj.allOf);
  }
}

function merge(into, schemas) {
  for (let subSchema of schemas) {
    if (into.type && subSchema.type && into.type !== subSchema.type) {
      let errMessage = `allOf merging: schemas with different types can't be merged`;
      throw new Error(errMessage);
    }
    if (into.type === 'array') {
      throw new Error('allOf merging: subschemas with type array are not supported yet');
    }
    into.type = into.type || subSchema.type;
    if (into.type === 'object' && subSchema.properties) {
      into.properties || (into.properties = {});
      Object.assign(into.properties, subSchema.properties);
    }

    // TODO merging constrains: maximum, minimum, etc.
    defaults(into, subSchema)
  }
}
