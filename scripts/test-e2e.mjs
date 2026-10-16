import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

// Fixture responses must never share Next's persistent fetch cache with a real preview.
const env = { ...process.env, NEXT_BUILD_DIR: '.next-e2e', GITHUB_TOKEN: '', SUPABASE_SERVICE_ROLE_KEY: '' };
const generatedConfig = ['next-env.d.ts', 'tsconfig.json'].map(path => [path, readFileSync(path)]);
let status = 1;
try {
  const build = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { env, stdio: 'inherit' });
  if (build.status === 0) {
    const tests = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], { env, stdio: 'inherit' });
    status = tests.status ?? 1;
  }
} finally {
  for (const [path, contents] of generatedConfig) writeFileSync(path, contents);
}
process.exitCode = status;
