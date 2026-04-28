const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@portal.com';
const ADMIN_PASS = 'Admin1234!';
const SCREENSHOTS_DIR = '/tmp/screenshots_amg';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  // Login
  await page.goto(`${BASE_URL}/login`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASS);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Dashboard admin
  await page.goto(`${BASE_URL}/admin/dashboard`, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000); // esperar que carreguin les dades

  const screenshot = path.join(SCREENSHOTS_DIR, '4_admin_dashboard_deep.png');
  await page.screenshot({ path: screenshot, fullPage: true });

  const bodyText = await page.textContent('body');

  // Verificar NaN
  const hasNaN = /NaN/.test(bodyText);
  const nanPositions = [];
  let idx = 0;
  while ((idx = bodyText.indexOf('NaN', idx)) !== -1) {
    nanPositions.push(bodyText.substring(Math.max(0, idx-20), idx+23));
    idx += 3;
  }

  // Buscar MRR, €, números
  const mrrCtx = (bodyText.match(/.{0,50}MRR.{0,70}/gi) || ['MRR no trobat']);
  const euroNums = (bodyText.match(/[0-9,.]+\s*€|€\s*[0-9,.]+/g) || []);

  console.log('=== TEST 4 DEEP ===');
  console.log('URL:', page.url());
  console.log('HasNaN:', hasNaN);
  if (nanPositions.length > 0) console.log('NaN contexts:', nanPositions);
  console.log('MRR context:', mrrCtx.join(' || '));
  console.log('Valors amb €:', euroNums.slice(0, 10));
  console.log('Screenshot:', screenshot);

  // Buscar text que contingui estadístiques/KPIs
  const statElements = await page.$$eval('[class*="stat"], [class*="kpi"], [class*="card"], [class*="metric"], [class*="dashboard"]', els =>
    els.slice(0, 10).map(el => el.textContent.trim().substring(0, 100))
  ).catch(() => []);
  console.log('Elements stats/KPI:', statElements);

  if (hasNaN) {
    console.log('❌ TEST 4 - Admin dashboard MRR: FALLA - NaN trobat');
    nanPositions.forEach(ctx => console.log('   Context:', ctx));
  } else if (euroNums.length > 0 || mrrCtx[0] !== 'MRR no trobat') {
    console.log('✅ TEST 4 - Admin dashboard MRR: OK - Valors numèrics correctes');
  } else {
    console.log('⚠️  TEST 4 - Admin dashboard MRR: INCERT - No NaN però tampoc MRR/€ visibles');
    console.log('   El component MRR pot no estar carregat o no existir en aquesta vista');
  }

  await page.close();
  await browser.close();
})();
