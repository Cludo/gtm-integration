import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";

const isProduction = process.env.BUILD !== 'development';

export default {
    input: './src/cludo-gtm.class.js',
    output: {
        name: 'cludoSession',
        file: './dist/cludo-gtm.js',
        format: 'iife',
        compact: true,
    },
    plugins: [
        resolve(),
        babel({ babelHelpers: 'bundled' }),
        isProduction && terser(),
    ]
};