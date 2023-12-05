// @ts-check

import {build} from 'esbuild';
// import inlineWorkerPlugin from 'esbuild-plugin-inline-worker';
// import { pnpPlugin } from '@yarnpkg/esbuild-plugin-pnp';

build({
  platform: 'node',
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['aws-sdk'],
  minify: true,
  format: 'esm',
  target: 'node18.0',
  sourcemap: true,
  outfile: 'bundle/bundle.js',
}).catch((e) => {
  console.log('Build not successful', e.message);
  process.exit(1);
});

build({
  platform: 'node',
  bundle: true,
  entryPoints: ['../core/src/services/node/nodejs-project/server.worker.ts'],
  external: ['aws-sdk'],
  minify: true,
  format: 'esm',
  target: 'node18.0',
  sourcemap: true,
  outfile: 'bundle/server.worker.js',
}).catch((e) => {
  console.log('Build not successful', e.message);
  process.exit(1);
});
