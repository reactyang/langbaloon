// Quick test to verify game loads and works
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  
  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  try {
    // Navigate to the game
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');
    
    // Check if main elements exist
    const canvas = await page.$('#gameCanvas');
    const menu = await page.$('#menuOverlay');
    const startBtn = await page.$('#startBtn');
    
    console.log('✓ Canvas:', canvas ? 'found' : 'MISSING');
    console.log('✓ Menu overlay:', menu ? 'found' : 'MISSING');
    console.log('✓ Start button:', startBtn ? 'found' : 'MISSING');
    
    // Check for categories loaded
    const categories = await page.$$('.category-btn');
    console.log('✓ Categories loaded:', categories.length);
    
    // Check for words in word list
    const words = await page.$$('.word-item');
    console.log('✓ Words in list:', words.length);
    
    // Report console logs
    console.log('\n--- Console logs ---');
    consoleLogs.forEach(log => {
      if (log.type === 'error') console.log('[ERROR]', log.text);
      else console.log('[LOG]', log.text);
    });
    
    // Report errors
    if (errors.length > 0) {
      console.log('\n--- Page Errors ---');
      errors.forEach(err => console.log('[PAGE ERROR]', err));
    } else {
      console.log('\n✓ No page errors');
    }
    
    // Try to start a game
    console.log('\n--- Starting game ---');
    await startBtn.click();
    await page.waitForTimeout(1000);
    
    // Check if menu is hidden
    const menuVisible = await page.$eval('#menuOverlay', el => !el.classList.contains('hidden'));
    console.log('Menu hidden after start:', !menuVisible);
    
    // Check if game is playing (balloons should spawn)
    await page.waitForTimeout(2000);
    
    // Type some pinyin
    await page.fill('#pinyinInput', 'yi');
    await page.press('#pinyinInput', 'Enter');
    console.log('✓ Typed "yi" and pressed Enter');
    
    await page.waitForTimeout(500);
    
    console.log('\n=== All checks complete ===');
    
  } catch (e) {
    console.error('Test failed:', e.message);
  }
  
  await browser.close();
})();
