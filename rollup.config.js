import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    'd3-selection': 'd3_selection',
    '@scola/d3-slider': 'd3_slider'
  },
  plugins: [
    babel({
      presets: ['es2015-rollup']
    })
  ]
};
