import { test, expect } from '@playwright/test';

test.describe('Gestió de Plans (Admin)', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login com a admin
    await page.goto('http://localhost:3001/login');
    await page.locator('input[name="email"]').fill('admin@portal.com');
    await page.locator('input[name="password"]').fill('Admin1234!');
    await page.locator('button[type="submit"]').click();
    
    // Esperar a arribar al dashboard
    await expect(page).toHaveURL(/.*admin\/dashboard/);
  });

  test('hauria de poder navegar a la pàgina de plans', async ({ page }) => {
    // Clicar a l'enllaç del sidebar (ajustat al títol de la traducció "Plans")
    await page.click('text=Plans');
    await expect(page).toHaveURL(/.*admin\/plans/);
    
    // Verificar que el títol de la pàgina és correcte
    const title = page.locator('h1');
    await expect(title).toContainText(/Plans/i);
  });

  test('hauria de mostrar la llista de plans', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/plans');
    
    // Verificar que hi ha una taula o llista de plans
    // Els plans solen tenir preus en euros (€)
    const priceText = page.locator('text=/€/').first();
    await expect(priceText).toBeVisible();
  });

  test('hauria d\'obrir el modal de nou pla', async ({ page }) => {
    await page.goto('http://localhost:3001/admin/plans');
    
    // Clicar al botó de nou pla (segons traducció "+ NOU PLA")
    await page.click('text=/NOU PLA/i');
    
    // Verificar que el modal és visible
    const modalTitle = page.locator('text=/NOU PLA/i').nth(1); // El títol del modal sol ser el mateix
    await expect(modalTitle).toBeVisible();
    
    // Verificar camps bàsics
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="slug"]')).toBeVisible();
    await expect(page.locator('input[name="priceMonthly"]')).toBeVisible();
  });
});
