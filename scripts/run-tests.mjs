process.env.ROLLUP_DISABLE_NATIVE = process.env.ROLLUP_DISABLE_NATIVE || '1';
process.env.ROLLUP_SKIP_NODE_RESOLVE =
  process.env.ROLLUP_SKIP_NODE_RESOLVE || '1';

const { startVitest } = await import('vitest/node');

const ctx = await startVitest('run', process.argv.slice(2), {
  run: {
    reporters: process.env.VITEST_REPORTERS?.split(',').filter(Boolean),
  },
});

if (!ctx) {
  process.exit(1);
}

if (ctx.state.getCountOfFailedTests()) {
  process.exitCode = 1;
}
