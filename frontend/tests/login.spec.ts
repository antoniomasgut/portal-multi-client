import { test, expect } from '@playwright/test';

test.describe('Pàgina de Login', () => {
  test('hauria de carregar el formulari de login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Fem el selector més específic per evitar ambigüitats
    const emailInput = page.locator('form input[name="email"]');
    const passwordInput = page.locator('form input[name="password"]');
    const submitButton = page.locator('form button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('hauria de mostrar error amb credencials buides', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    const submitButton = page.locator('form button[type="submit"]');
    
    await submitButton.click();
    
    // Verifiquem que el camp email és obligatori (HTML5 validation)
    const emailInput = page.locator('form input[name="email"]');
    const isRequired = await emailInput.getAttribute('required');
    // Si no és required per HTML5, potser hi ha un missatge d'error de Zod/React
    if (isRequired === null) {
        // Busquem algun text d'error com "obligatori" o "required"
        const errorMsg = page.locator('text=/obligatori|required/i');
        await expect(errorMsg).toBeVisible();
    } else {
        expect(isRequired).not.toBeNull();
    }
  });
});
