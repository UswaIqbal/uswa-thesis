// End-to-end smoke test for the full study flow.
//
//   consent -> 4x (interface -> 13-question / 7-point survey) -> open-ended
//   -> "A few final quick questions" -> completion
//
// Runs against the Vite dev server, so persistence uses the in-memory dev store
// (no Supabase project needed). Verifies screen order, the revised questionnaire
// shape, the final-quick heading and position, and that completion succeeds.
//
//   npm run test:e2e

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const PORT = 5199;
const BASE = `http://localhost:${PORT}/`;

function startDevServer() {
  const viteBin = join(dirname(require.resolve('vite/package.json')), 'bin/vite.js');
  return spawn(process.execPath, [viteBin, '--port', String(PORT), '--strictPort'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('Vite dev server did not start in time');
}

const assert = (cond, msg) => {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`);
  console.log(`  ok  ${msg}`);
};

async function screenId(page) {
  return page.locator('[data-screen-id]').first().getAttribute('data-screen-id');
}

async function run() {
  const server = startDevServer();
  server.stderr.on('data', (d) => process.env.DEBUG && console.error(String(d)));
  await waitForServer();

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 850 } }); // mobile viewport
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  try {
    await page.goto(BASE);

    // intro
    assert((await screenId(page)) === 'study_introduction', 'starts on study introduction');
    await page.getByRole('button', { name: 'Continue' }).click();

    // consent
    assert((await screenId(page)) === 'consent', 'consent screen follows intro');
    await page
      .getByRole('radio', { name: 'I have read the study information and agree to participate.' })
      .click();
    await page.getByRole('button', { name: 'Continue' }).click();

    const conditionsSeen = [];
    for (let i = 0; i < 4; i++) {
      // subscription billing
      assert((await screenId(page)) === 'subscription_billing', `interface ${i + 1}: subscription billing`);
      await page.locator('#cancel_subscription').click();

      // treatment (t0_/p1_/p2_/p3_ _treatment)
      const tId = await screenId(page);
      assert(/^(t0|p1|p2|p3)_treatment$/.test(tId), `interface ${i + 1}: treatment screen (${tId})`);
      conditionsSeen.push(tId.split('_')[0]);
      await page.locator('#confirm_cancellation').click();

      // processing -> outcome
      await page.locator('#continue_to_survey').click();

      // survey
      assert((await screenId(page)) === 'post_condition_questionnaire', `interface ${i + 1}: questionnaire`);
      const groups = page.locator('.likert-group[role="radiogroup"]');
      const groupCount = await groups.count();
      assert(groupCount === 13, `interface ${i + 1}: 13 questionnaire items (got ${groupCount})`);
      const optionsInFirst = await groups.first().locator('.likert-option').count();
      assert(optionsInFirst === 7, `interface ${i + 1}: 7-point scale (got ${optionsInFirst})`);
      assert(
        (await page.locator('text=/1 = Strongly disagree, 7 = Strongly agree/').count()) === 1,
        `interface ${i + 1}: 7-point anchors shown`,
      );
      // UMUX item 1 is present and first
      assert(
        (await page.locator('text=/1\\. The system\'s capabilities meet my requirements\\./').count()) === 1,
        `interface ${i + 1}: UMUX Q1 is first`,
      );
      for (let g = 0; g < groupCount; g++) {
        await groups.nth(g).locator('.likert-option').nth(g % 7).click();
      }
      await page.locator('#survey_submit').click();

      if (i < 3) {
        assert((await screenId(page)) === 'between_conditions', `interface ${i + 1}: transition screen`);
        await page.locator('#continue_to_next_condition').click();
      }
    }

    assert(new Set(conditionsSeen).size === 4, `all four conditions shown once (${conditionsSeen.join(',')})`);

    // open-ended
    assert((await screenId(page)) === 'final_open_ended', 'open-ended screen after 4th questionnaire');
    const areas = page.locator('textarea.text-area');
    assert((await areas.count()) === 2, 'two open-ended questions');
    await areas.nth(0).fill('The framing on some versions nudged me.');
    await areas.nth(1).fill('The transparent version was clearest.');
    await page.getByRole('button', { name: 'Continue' }).click();

    // final quick questions — must come AFTER open-ended, with exact heading
    assert((await screenId(page)) === 'final_quick_questions', 'final quick questions come after open-ended');
    assert(
      (await page.getByRole('heading', { name: 'A few final quick questions', exact: true }).count()) === 1,
      'heading is exactly "A few final quick questions"',
    );
    const radioRows = page.locator('.radio-row');
    await radioRows.nth(0).click(); // Q1 first option
    // second question's first option is the 4th radio-row (3 options in Q1)
    await radioRows.nth(3).click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // completion
    assert((await screenId(page)) === 'completion', 'completion screen is last');
    await page.locator('#finish_study').click();
    await page.locator('text=/You may now close this window/').waitFor({ timeout: 10000 });
    assert(true, 'completion save succeeded');

    assert(errors.length === 0, `no console/page errors (${JSON.stringify(errors)})`);

    console.log('\nSMOKE TEST PASSED');
  } finally {
    await browser.close();
    server.kill('SIGTERM');
  }
}

run().catch((e) => {
  console.error('\n' + e.stack);
  process.exitCode = 1;
});
