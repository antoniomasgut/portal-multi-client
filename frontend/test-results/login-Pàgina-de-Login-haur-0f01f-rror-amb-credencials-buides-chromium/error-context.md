# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Pàgina de Login >> hauria de mostrar error amb credencials buides
- Location: tests/login.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/obligatori|required/i')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/obligatori|required/i')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - paragraph [ref=e5]: PORTAL DE GESTIÓ
        - heading "AMG Enginyeria Digital" [level=1] [ref=e6]
        - paragraph [ref=e7]: Sistema de gestió de clients
      - generic [ref=e8]:
        - paragraph [ref=e11]: Accés al portal
        - generic [ref=e12]:
          - generic [ref=e13]:
            - generic [ref=e14]:
              - generic [ref=e15]: Email
              - textbox "admin@portal.com" [active] [ref=e16]
              - paragraph [ref=e17]: Email no vàlid
            - generic [ref=e18]:
              - generic [ref=e19]: Contrasenya
              - generic [ref=e20]:
                - textbox "••••••••" [ref=e21]
                - button "VEURE" [ref=e22] [cursor=pointer]
              - paragraph [ref=e23]: La contrasenya és obligatòria
            - button "ENTRAR" [ref=e24] [cursor=pointer]
          - generic [ref=e27]: O
          - generic [ref=e29]:
            - paragraph [ref=e30]: Accés via link màgic
            - textbox "el-teu@email.com" [ref=e31]
            - button "ENVIAR LINK" [disabled] [ref=e32]
  - alert [ref=e33]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Pàgina de Login', () => {
  4  |   test('hauria de carregar el formulari de login', async ({ page }) => {
  5  |     await page.goto('http://localhost:3000/login');
  6  | 
  7  |     // Fem el selector més específic per evitar ambigüitats
  8  |     const emailInput = page.locator('form input[name="email"]');
  9  |     const passwordInput = page.locator('form input[name="password"]');
  10 |     const submitButton = page.locator('form button[type="submit"]');
  11 | 
  12 |     await expect(emailInput).toBeVisible();
  13 |     await expect(passwordInput).toBeVisible();
  14 |     await expect(submitButton).toBeVisible();
  15 |   });
  16 | 
  17 |   test('hauria de mostrar error amb credencials buides', async ({ page }) => {
  18 |     await page.goto('http://localhost:3000/login');
  19 |     const submitButton = page.locator('form button[type="submit"]');
  20 |     
  21 |     await submitButton.click();
  22 |     
  23 |     // Verifiquem que el camp email és obligatori (HTML5 validation)
  24 |     const emailInput = page.locator('form input[name="email"]');
  25 |     const isRequired = await emailInput.getAttribute('required');
  26 |     // Si no és required per HTML5, potser hi ha un missatge d'error de Zod/React
  27 |     if (isRequired === null) {
  28 |         // Busquem algun text d'error com "obligatori" o "required"
  29 |         const errorMsg = page.locator('text=/obligatori|required/i');
> 30 |         await expect(errorMsg).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  31 |     } else {
  32 |         expect(isRequired).not.toBeNull();
  33 |     }
  34 |   });
  35 | });
  36 | 
```