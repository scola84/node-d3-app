import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    '@scola/d3-gesture': 'd3',
    '@scola/d3-media': 'd3',
    '@scola/d3-slider': 'd3',
    'd3-selection': 'd3',
    'd3-selection-multi': 'd3',
    'd3-transition': 'd3'
  },
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs(),
    buble()
  ]
};
