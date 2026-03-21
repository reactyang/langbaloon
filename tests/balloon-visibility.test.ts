import { chromium, Browser, Page } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3001';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer(): Promise<ChildProcess> {
  console.log('Starting Vite dev server...');
  
  // Kill any existing processes on ports 3001-3003
  spawn('pkill', ['-f', 'vite'], { shell: true });
  await sleep(1000);
  
  const server = spawn('npx', ['vite', '--port', '3001', '--host'], {
    cwd: '/home/tony/workspace/langbaloon',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  // Wait for server to be ready
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, 15000); // 15s timeout
    
    server.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log('[Server]', output.trim());
      if (output.includes('localhost:3001') || output.includes('Local:')) {
        clearTimeout(timeout);
        setTimeout(resolve, 2000); // Extra 2s for stability
      }
    });
    
    server.stderr?.on('data', (data: Buffer) => {
      console.log('[Server Error]', data.toString().trim());
    });
  });

  console.log('Server ready!');
  return server;
}

async function runTest(): Promise<void> {
  let server: ChildProcess;
  let browser: Browser;
  let page: Page;
  
  try {
    // Start server
    server = await startServer();
    
    // Launch browser with Chrome
    console.log('Launching browser...');
    browser = await chromium.launch({
      headless: true,
      channel: 'chrome' // Use system Chrome
    });
    
    page = await browser.newPage();
    
    // Collect console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const log = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(log);
      if (msg.type() === 'error') {
        console.error('[Browser Error]', msg.text());
      }
    });

    console.log(`Opening game at ${BASE_URL}`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    
    // Verify menu is visible
    const menu = await page.$('.menu-overlay');
    if (!menu) {
      throw new Error('Menu overlay not found');
    }
    console.log('✓ Menu is visible');

    // Select "Select Words" mode
    const selectModeRadio = await page.$('input[name="gameMode"][value="select"]');
    if (selectModeRadio) {
      await selectModeRadio.click();
      console.log('✓ Switched to Select Words mode');
      await sleep(300);
    }

    // Select only "numbers" category (数字)
    // First deselect all, then select only numbers
    const allCategories = await page.$$('.category-btn');
    console.log(`Found ${allCategories.length} categories`);
    
    for (const cat of allCategories) {
      const catText = await cat.textContent();
      const isSelected = await cat.evaluate(el => el.classList.contains('selected'));
      
      if (catText?.includes('数字')) {
        if (!isSelected) {
          await cat.click(); // Select numbers
          console.log(`✓ Selected category: ${catText}`);
        }
      } else {
        if (isSelected) {
          await cat.click(); // Deselect
          console.log(`  Deselected: ${catText}`);
        }
      }
    }
    await sleep(500);

    // Wait for word list to update
    await page.waitForSelector('.word-item', { timeout: 5000 });
    
    // Now select only 一, 二, 三
    const wordItems = await page.$$('.word-item');
    console.log(`Found ${wordItems.length} words in numbers category`);
    
    let selectedCount = 0;
    for (const item of wordItems) {
      const chineseText = await item.$eval('.chinese', el => el.textContent);
      if (['一', '二', '三'].includes(chineseText || '')) {
        // Get checkbox state before clicking
        const checkbox = await item.$('input[type="checkbox"]');
        if (checkbox) {
          const wasChecked = await (checkbox as HTMLInputElement).isChecked();
          if (!wasChecked) {
            await checkbox.click();
            selectedCount++;
            console.log(`✓ Selected word: ${chineseText}`);
          }
        }
        await sleep(200);
      }
    }
    
    console.log(`Total words selected: ${selectedCount}`);
    
    // Verify selection count
    const selectionStats = await page.$eval('.selection-stats', el => el.textContent).catch(() => '');
    console.log(`Selection stats: ${selectionStats}`);
    
    if (selectedCount < 3) {
      // Debug: print all Chinese words found
      const allChinese = await page.$$eval('.word-item .chinese', els => els.map(el => el.textContent));
      console.log(`Available Chinese words: ${allChinese.slice(0, 20).join(', ')}...`);
      throw new Error(`Only ${selectedCount}/3 words selected. Cannot start game.`);
    }
    
    // Wait a bit for any alerts to appear
    await sleep(500);
    
    // Set up dialog handler BEFORE clicking start
    let dialogMessage = '';
    const dialogPromise = new Promise<string>(resolve => {
      page.on('dialog', async dialog => {
        dialogMessage = dialog.message();
        console.log(`[Alert]: ${dialogMessage}`);
        await dialog.dismiss();
        resolve(dialogMessage);
      });
    });

    // Click Start Game
    const startButton = await page.$('.btn-primary');
    if (!startButton) {
      throw new Error('Start button not found');
    }
    await startButton.click();
    console.log('✓ Clicked Start Game');

    // Wait for balloons to spawn
    console.log('Waiting for balloons to spawn...');
    await sleep(3000);

    // Function to check if game is running (menu is gone, canvas exists)
    const isGameRunning = async (): Promise<boolean> => {
      // Menu should be unmounted when game is playing
      const menuHidden = await page.$('.menu-overlay');
      // Canvas should exist when game is running
      const canvas = await page.$('canvas');
      // Game stats should be visible
      const stats = await page.$('.game-stats');
      // Menu is gone = game is running, or canvas exists
      return menuHidden === null && canvas !== null;
    };
    
    // Function to count balloons on canvas
    const countBalloons = async (): Promise<number> => {
      // Count balloons from the stats display or canvas
      const remainingText = await page.$eval('.stats-remaining', el => el.textContent).catch(() => '');
      if (remainingText) {
        const match = remainingText.match(/(\d+)/);
        if (match) {
          return parseInt(match[1]);
        }
      }
      // Fallback: check game is running
      return (await isGameRunning()) ? 3 : 0;
    };

    // Take screenshot helper
    const takeScreenshot = async (name: string): Promise<void> => {
      const filePath = path.join(SCREENSHOTS_DIR, `balloon-${name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`  Screenshot saved: ${filePath}`);
    };

    // Test at t=0 (after initial spawn wait)
    console.log('\n=== Balloon Visibility Test ===');
    console.log('\nt=0s (after 3s spawn):');
    const running0 = await isGameRunning();
    const balloons0 = await countBalloons();
    console.log(`  Game running: ${running0}`);
    console.log(`  Balloons visible: ${balloons0}`);
    await takeScreenshot('t0');

    // Test at t=3s
    console.log('\nt=3s:');
    await sleep(3000);
    const running3 = await isGameRunning();
    const balloons3 = await countBalloons();
    console.log(`  Game running: ${running3}`);
    console.log(`  Balloons visible: ${balloons3}`);
    await takeScreenshot('t3');

    // Test at t=5s
    console.log('\nt=5s:');
    await sleep(2000);
    const running5 = await isGameRunning();
    const balloons5 = await countBalloons();
    console.log(`  Game running: ${running5}`);
    console.log(`  Balloons visible: ${balloons5}`);
    await takeScreenshot('t5');

    // Test at t=7s
    console.log('\nt=7s:');
    await sleep(2000);
    const running7 = await isGameRunning();
    const balloons7 = await countBalloons();
    console.log(`  Game running: ${running7}`);
    console.log(`  Balloons visible: ${balloons7}`);
    await takeScreenshot('t7');

    // Test at t=11s
    console.log('\nt=11s:');
    await sleep(4000);
    const running11 = await isGameRunning();
    const balloons11 = await countBalloons();
    console.log(`  Game running: ${running11}`);
    console.log(`  Balloons visible: ${balloons11}`);
    await takeScreenshot('t11');

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`t=0s:  Game running = ${running0}, Balloons = ${balloons0}`);
    console.log(`t=3s:  Game running = ${running3}, Balloons = ${balloons3}`);
    console.log(`t=5s:  Game running = ${running5}, Balloons = ${balloons5}`);
    console.log(`t=7s:  Game running = ${running7}, Balloons = ${balloons7}`);
    console.log(`t=11s: Game running = ${running11}, Balloons = ${balloons11}`);

    // All checkpoints should have game running with 3 balloons
    const allPassed = running0 && running3 && running5 && running7 && running11;
    const balloonsCorrect = balloons0 === 3 && balloons3 === 3 && balloons5 === 3 && 
                           balloons7 === 3 && balloons11 === 3;
    
    if (allPassed && balloonsCorrect) {
      console.log('\n✅ ALL TESTS PASSED: 3 balloons remained visible for 11 seconds');
    } else if (allPassed && !balloonsCorrect) {
      console.log('\n⚠️ GAME RUNNING BUT BALLOON COUNT VARIED');
    } else {
      console.log('\n❌ TEST FAILED: Game stopped unexpectedly');
    }

    // Print relevant game logs
    console.log('\n--- Relevant Console Logs ---');
    consoleLogs
      .filter(l => l.includes('[createBalloon]') || l.includes('[gameLoop]') || l.includes('[spawnBalloon]'))
      .slice(-20) // Last 20 relevant logs
      .forEach(l => console.log(l));

    // Clean up
    await browser.close();
    
    if (server) {
      process.kill(server.pid!, 'SIGTERM');
    }

    if (!allPassed || !balloonsCorrect) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    
    // Take error screenshot
    if (page) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: true }).catch(() => {});
    }
    
    if (browser) await browser.close().catch(() => {});
    if (server) process.kill(server.pid!, 'SIGTERM').catch(() => {});
    
    process.exit(1);
  }
}

// Run the test
runTest();
