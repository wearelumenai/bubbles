import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: 'index.js',
  output: {
    file: 'bubbles.js',
    format: 'umd',
    name: 'bub',
    compact: true
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    uglify()
  ]
}
