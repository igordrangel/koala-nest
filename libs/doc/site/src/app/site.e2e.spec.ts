import { expect, test } from '@playwright/test';

test('redireciona / para landing em português', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/pt$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('landing em inglês carrega', async ({ page }) => {
  await page.goto('/en');
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('h1')).toBeVisible();
});

test('abre página de documentação em português', async ({ page }) => {
  await page.goto('/pt/docs/inicio/guia-de-instalacao');
  await expect(page.locator('h1')).toContainText(/instala/i);
});

test('abre página de documentação em inglês', async ({ page }) => {
  await page.goto('/en/docs/getting-started/installation-guide');
  await expect(page.locator('h1')).toContainText(/installation/i);
});

test('expõe llms.txt e markdown estático', async ({ request }) => {
  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBeTruthy();
  expect(await llms.text()).toContain('Koala Nest');

  const md = await request.get('/markdown/pt/inicio/guia-de-instalacao.md');
  expect(md.ok()).toBeTruthy();
  expect(await md.text()).toContain('---');
});
