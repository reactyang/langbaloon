import { chromium } from 'playwright';

async function testGame() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect console logs
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  try {
    console.log('Opening game at http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('Page title:', await page.title());
    
    // Switch to "Random" mode
    const randomModeRadio = await page.$('input[name="gameMode"][value="random"]');
    if (randomModeRadio) {
      await randomModeRadio.click();
      console.log('Switched to Random mode');
    }
    
    // Click "Start Game" button (the primary button)
    const startButton = await page.$('button.btn-primary');
    if (startButton) {
      await startButton.click();
      console.log('Clicked Start Game');
    }
    
    // Wait for balloons to spawn
    await page.waitForTimeout(5000);
    
    // Check canvas exists
    const canvas = await page.$('canvas');
    console.log('Canvas found:', !!canvas);
    
    // Check for spawn logs
    const spawnLogs = logs.filter(l => l.includes('[createBalloon]'));
    console.log('Balloons created:', spawnLogs.length);
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('Screenshot saved');
    
    // Test popping a balloon - find the input field and type
    const inputField = await page.$('input[type="text"]');
    if (inputField) {
      // Type "mao" to pop 猫 (cat) - assuming it's visible
      await inputField.fill('mao');
      await inputField.press('Enter');
      console.log('Typed "mao" and pressed Enter');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-after-pop.png' });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testGame();