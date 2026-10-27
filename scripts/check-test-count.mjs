// The site claims a number of automated tests (TESTS_CLAIM in src/content/site.ts, e.g. '260+'). This
// runs the unit tests and lists the browser tests, counting each browser test once (one browser; CI
// runs them in four), and fails if a test fails or the claim is no longer true.
//   node scripts/check-test-count.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const claim = parseInt(readFileSync('src/content/site.ts', 'utf8').match(/TESTS_CLAIM = '(\d+)\+'/)[1], 10);
const run = (args) => {
  try {
    return execFileSync('npx', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    return e.stdout; // vitest exits non-zero when a test fails; its JSON report still says so below.
  }
};

// Vitest writes its JSON report to a file; keep it out of the repo.
const tmp = mkdtempSync(join(tmpdir(), 'check-tests-'));
run(['vitest', 'run', '--reporter=json', `--outputFile.json=${join(tmp, 'unit.json')}`, '--silent']);
const unitReport = JSON.parse(readFileSync(join(tmp, 'unit.json'), 'utf8'));
rmSync(tmp, { recursive: true, force: true });
const browserList = JSON.parse(run(['playwright', 'test', '--list', '--reporter=json', '--project=chromium']));
let browser = 0;
const walk = (suite) => {
  for (const spec of suite.specs ?? []) browser += spec.tests.length;
  for (const child of suite.suites ?? []) walk(child);
};
browserList.suites.forEach(walk);

const total = unitReport.numTotalTests + browser;
console.log(`check-tests: ${unitReport.numTotalTests} unit + ${browser} browser = ${total} tests; the site says ${claim}+.`);
if (!unitReport.success) { console.error('check-tests: unit tests failed (run npm test for details).'); process.exit(1); }
if (total < claim) { console.error(`check-tests: only ${total} tests, but the site claims ${claim}+. Lower TESTS_CLAIM.`); process.exit(1); }
