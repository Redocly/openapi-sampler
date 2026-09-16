import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/openapi-sampler.js',
  output: {
    file: 'dist/openapi-sampler.js',
    format: 'umd',
    name: 'OpenAPISampler',
  },
  plugins: [
    nodeResolve({ browser: true }),
    commonjs(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
  ],
};
