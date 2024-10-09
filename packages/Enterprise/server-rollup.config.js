import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';

const rootPath = path.resolve(__dirname, '../../');
const rootServerPath = path.resolve(__dirname, '../../api');
const entryPath = path.resolve(rootPath, 'api/index.js'); // Corrigiendo la ruta de entrada
const enterprisePath = path.resolve(rootPath, 'packages/Enterprise');

console.log('entryPath', entryPath);

// Define your custom aliases here
const customAliases = {
  entries: [
    { find: '~', replacement: rootServerPath },
    { find: 'Enterprise', replacement: enterprisePath }, // Alias para Enterprise
  ],
};

export default {
  input: entryPath,
  output: {
    file: 'test_bundle/bundle.js',
    format: 'cjs',
  },
  plugins: [
    alias(customAliases),
    resolve({
      preferBuiltins: true,
      extensions: ['.js', '.json', '.node'],
    }),
    commonjs(),
    json(),
  ],
  external: (id) => {
    // More selective external function
    if (/node_modules/.test(id)) {
      return !id.startsWith('langchain/');
    }
    return false;
  },
};