import manifest  from '../package.json';
import path from 'path';

module.exports = {
  entryFileName: 'json-schema-sampler',
  mainVarName: 'JSONSchemaSampler',
  mainFile: manifest.main,
  destinationFolder: path.dirname(manifest.main),
  exportFileName: path.basename(manifest.main, path.extname(manifest.main))
};
