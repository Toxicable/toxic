import * as rollup from 'rollup';
import { Options } from '../interfaces';
import ts from 'rollup-plugin-typescript2';
import * as path from 'path';
import { Subject } from 'rxjs/Subject';
import { logging } from '@angular-devkit/core';
import resolve from 'rollup-plugin-node-resolve';

const tsPlugin: any = ts;


export function watchRollup(entry: string, outDir: string, tsconfig: string, logger: logging.Logger) {
  const inputOptions: rollup.InputOptions = {
    // core options
    input: entry, // the only required option
    preserveSymlinks: true,

    plugins: [
      ts({
        tsconfig: tsconfig,
      }) as any,
      //resolve()
    ],
  };

  const outputOptions: rollup.OutputOptions = {
    sourcemap: 'inline',
    // core options
    file: path.join(outDir,  'bundle.js'),   // required with bundle.write
    format: 'cjs', // required
  };

  const watchOptions: rollup.RollupWatchOptions = {
    ...inputOptions,
    output: outputOptions,
  };

  const watcher = rollup.watch([watchOptions]);
  const bundled$ = new Subject();


  // see below for details on the options
  let startedAt: Date;
  watcher.on('event', (event: any) => {

    if (event.code === 'START') {
      logger.info('start bundling');
      startedAt = new Date();
    }

    if (event.code === 'END') {
      const interval = Number(new Date()) - Number(startedAt);
      logger.info(`end bundling, took: ${interval}ms`);
      bundled$.next();
    }

    if (event.code === 'ERROR') {
      logger.info('err');
      logger.info(event.error.message);
    }

    if (event.code === 'FATAL') {
      logger.info('whops, something fatal');
      logger.info(event.error.message);
    }
  });
  return bundled$;
}
