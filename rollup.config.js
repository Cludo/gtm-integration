import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.BUILD != 'development';

export default {
    input: './src/cludo-gtm.js',
    output: {
        name: 'cludoSession',
        file: './dist/cludo-gtm.js',
        format: 'iife'
    },
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        isProduction && terser()
    ]
};