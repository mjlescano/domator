import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/domator.js',
  format: 'cjs',
  plugins: [babel()],
  dest: 'domator.js'
}
