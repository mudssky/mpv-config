import { glob } from 'glob'
import path from 'node:path'
import ts from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
const baseConfig = {
  output: {
    format: 'esm',
    dir: '../scripts',
  },
  external: false,
  plugins: [
    ts({
      tsconfig: './tsconfig.json',
    }),
    resolve(),
    commonjs(),
  ],
}
export default glob
  .globSync('src/*.ts')
  .filter((item) => {
    return !item.includes('audio-playback')
  })
  .map((item) => {
    return {
      input: item,
      ...baseConfig,
    }
  })
