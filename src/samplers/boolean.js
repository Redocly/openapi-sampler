export function sampleBoolean(schema, options={}) {
  if (options.omissible) {
    return null;
  }
  return true; // let be optimistic :)
}
