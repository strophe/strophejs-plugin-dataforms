import coffeescript from 'rollup-plugin-coffee-script';

export default {
  input: 'src/strophe.x.coffee',
  output: {
    file: 'lib/strophe.x.js',
    format: 'umd',
    globals: {
      'strophe.js': 'window',
    },
  },
  external: ['strophe.js'],
  plugins: [coffeescript()],
};
