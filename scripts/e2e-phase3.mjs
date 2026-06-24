import {chromium} from '@playwright/test';
import {createServer} from 'vite';
import * as esbuild from 'esbuild';
import {spawn} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

let vitePort = 0;

async function buildElectron() {
  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    external: ['electron', 'better-sqlite3'],
    outfile: 'dist-electron/main/main.cjs',
  });
  await esbuild.build({
    entryPoints: ['electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    external: ['electron'],
    outfile: 'dist-electron/preload/preload.js',
  });
}

async function startVite() {
  const vite = await createServer({
    configFile: 'vite.config.ts',
    root,
    server: {port: 0},
  });
  await vite.listen();
  const address = vite.httpServer.address();
  vitePort = typeof address === 'string' ? 0 : address.port;
  console.log(`Vite dev server ready at http://localhost:${vitePort}`);
  return vite;
}

function launchElectron(userDataDir) {
  const env = {...process.env};
  delete env.ELECTRON_RUN_AS_NODE;
  env.VITE_DEV_SERVER_URL = `http://localhost:${vitePort}`;

  return spawn(
    'node',
    [
      join(root, 'node_modules/electron/cli.js'),
      join(root, 'dist-electron/main/main.cjs'),
      '--remote-debugging-port=9223',
      `--user-data-dir=${userDataDir}`,
    ],
    {
      cwd: root,
      env,
      stdio: 'pipe',
    },
  );
}

async function waitForCdp(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch('http://localhost:9223/json/version');
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('CDP not available within timeout');
}

async function main() {
  const userDataDir = mkdtempSync(join(tmpdir(), 'nai-agent-e2e-'));
  let electronProc;
  let vite;

  try {
    await buildElectron();
    vite = await startVite();

    console.log('Launching Electron...');
    electronProc = launchElectron(userDataDir);

    electronProc.stdout.on('data', (d) => console.log('[electron]', d.toString().trim()));
    electronProc.stderr.on('data', (d) => console.error('[electron]', d.toString().trim()));

    await waitForCdp();
    console.log('Electron CDP ready');

    const browser = await chromium.connectOverCDP('http://localhost:9223');
    const context = browser.contexts()[0];
    const pages = context.pages();
    const page = pages.find((p) => p.url().includes(`localhost:${vitePort}`));
    if (!page) {
      throw new Error('App page not found in CDP targets');
    }

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    console.log('Step 1: Dashboard loaded');
    await page.screenshot({path: 'e2e-01-dashboard.png'});

    // Navigate to project list via sidebar
    console.log('Step 2: Navigate to project list');
    const sidebarButtons = page.locator('aside nav button');
    const buttonTexts = await sidebarButtons.allTextContents();
    console.log('Sidebar button texts:', buttonTexts);
    const projectListBtn = sidebarButtons.filter({hasText: /项目管理|Projects/}).first();
    await projectListBtn.evaluate((el) => el.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true})));
    await page.waitForTimeout(2500);
    await page.screenshot({path: 'e2e-02-project-list.png'});

    // Create project
    console.log('Step 3: Create project');
    await page.locator('button').filter({hasText: /创建项目|Create Project/}).first().click();
    await page.waitForTimeout(500);
    const nameInput = page.locator('input').first();
    await nameInput.fill('E2E Test Project');
    const descInput = page.locator('textarea').first();
    await descInput.fill('Created by automated verification');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await page.screenshot({path: 'e2e-03-project-created.png'});

    const projectCard = page.locator('text=E2E Test Project').first();
    if (await projectCard.isVisible().catch(() => false)) {
      console.log('✅ Project created and visible');
    } else {
      throw new Error('Project not visible after creation');
    }

    // Open project KB ingest
    console.log('Step 4: Open project KB');
    await projectCard.click();
    await page.waitForTimeout(1500);
    await page.screenshot({path: 'e2e-04-kb-ingest.png'});

    // Add text entry
    console.log('Step 5: Add text entry');
    const titleInput = page.locator('input').first();
    await titleInput.fill('Test Entry');
    const textarea = page.locator('textarea').first();
    await textarea.fill('This is a test knowledge entry created by Playwright.');
    await page.locator('button').filter({hasText: /提交|Submit|录入/}).first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({path: 'e2e-05-entry-added.png'});

    const entryTitle = page.locator('text=Test Entry').first();
    if (await entryTitle.isVisible().catch(() => false)) {
      console.log('✅ Knowledge entry added and visible');
    } else {
      throw new Error('Knowledge entry not visible after ingestion');
    }

    console.log('All Phase 3 verification checks passed.');
    await browser.close();
  } finally {
    if (electronProc) {
      electronProc.kill();
      await new Promise((resolve) => {
        electronProc.on('exit', resolve);
        setTimeout(resolve, 5000);
      });
    }
    if (vite) await vite.close();
    await new Promise((r) => setTimeout(r, 500));
    rmSync(userDataDir, {recursive: true, force: true});
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('E2E verification failed:', err);
    process.exit(1);
  });
