import buble from 'rollup-plugin-buble';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    'd3-selection': 'd3',
    '@scola/d3-slider': 'd3'
  },
  plugins: [
    buble()
  ]
};
