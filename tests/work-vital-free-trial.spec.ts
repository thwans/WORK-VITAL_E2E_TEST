import { test, expect } from '@playwright/test';

test('WORK VITAL stress diagnosis free trial reaches the application form', async ({ page, isMobile }, testInfo) => {
  test.setTimeout(60_000);

  const artifactUrl = 'https://claude.ai/artifact/PDoCQjYmUNZMevge89onRq';
  const artifact = page
    .getByTitle('User-generated artifact content', { exact: true })
    .contentFrame();
  const summary = artifact.getByRole('complementary', { name: '선택 요약', exact: true });
  const applyButton = summary.getByRole('button', { name: '무료 체험 신청하기', exact: true });
  const expectedArtifactUrl = new URL(artifactUrl);
  const isExpectedArtifactUrl = (url: URL) =>
    url.origin === expectedArtifactUrl.origin &&
    url.pathname === expectedArtifactUrl.pathname &&
    url.search === expectedArtifactUrl.search &&
    (url.hash === '' || url.hash === '#top');
  const readContentUrl = () => artifact.locator('html').evaluate(element => element.ownerDocument.URL);

  const initialContentUrl = await test.step('WORK VITAL 첫 화면 확인', async () => {
    await page.goto(`${artifactUrl}#top`);
    await expect(page).toHaveURL(isExpectedArtifactUrl);
    await expect(artifact.getByRole('heading', { level: 1 })).toHaveText(
      /^3분의 응답으로,\s*조직의\s*맥박을 읽습니다\.$/,
      { timeout: 15_000 },
    );
    return new URL(await readContentUrl());
  });

  await test.step('PC GNB 또는 모바일 전체 메뉴에서 무료체험 열기', async () => {
    const header = artifact.getByRole('banner');
    let freeTrialLink = header.getByRole('link', { name: '무료체험', exact: true });

    if (isMobile) {
      const menuButton = header.getByRole('button', { name: '전체 메뉴 열기', exact: true });
      await expect(menuButton).toBeVisible();
      await expect(menuButton).toHaveAttribute('aria-controls', 'drawer');
      await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      await menuButton.click();
      await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // The observed drawer has no named ARIA role; scope its link by its stable ID.
      const menu = header.locator('#drawer');
      await expect(menu).toBeVisible();
      freeTrialLink = menu.getByRole('link', { name: '무료체험', exact: true });
    }

    await expect(freeTrialLink).toBeVisible({ timeout: 15_000 });
    await expect(freeTrialLink).toHaveAttribute('href', 'free.html');
    await freeTrialLink.click();
  });

  await test.step('무료체험 화면의 진단 선택 영역 확인', async () => {
    await expect(artifact.getByRole('heading', {
      name: '진단 1종을 한 달 동안 무료로 체험하세요', exact: true,
    })).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(isExpectedArtifactUrl);
    await expect.poll(readContentUrl).toBe(new URL('free.html', initialContentUrl).href);
    // The diagnosis selection area is already displayed; it is not a separate menu.
    await expect(artifact.getByText('1종만 선택할 수 있어요', { exact: true })).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(summary.getByText('0종', { exact: true })).toBeVisible();
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toBeDisabled();
  });

  await test.step('스트레스 진단 선택 및 선택 요약 확인', async () => {
    const stressDiagnosis = artifact.getByRole('button', {
      name: '스트레스 진단 직무 스트레스를 원인·반응·환경·습관 4개 영역으로 세밀히 가시화합니다.',
      exact: true,
    });
    await expect(stressDiagnosis).toBeVisible();
    await stressDiagnosis.click();
    await expect(summary.getByText('스트레스 진단', { exact: true })).toBeVisible();
    await expect(summary.getByText('1종', { exact: true })).toBeVisible();
    await expect(artifact.getByRole('heading', {
      name: '진단 1종을 한 달 동안 무료로 체험하세요', exact: true,
    })).toBeVisible();
    await expect.poll(readContentUrl).toBe(new URL('free.html', initialContentUrl).href);
    await expect(applyButton).toBeVisible();
    await expect(applyButton).toBeEnabled();
  });

  await test.step('무료 체험 신청하기 클릭 후 도착 화면과 URL 기록', async () => {
    await applyButton.click();
    await expect(artifact.getByRole('heading', {
      name: '진단 1종 무료로 시작하세요', exact: true,
    })).toBeVisible({ timeout: 15_000 });
    await expect(artifact.getByRole('navigation', { name: '신청 유형', exact: true })).toBeVisible();
    await expect(artifact.getByRole('checkbox', {
      name: '스트레스 진단', exact: true,
    })).toBeChecked();
    // Only the outer wrapper's empty hash / #top difference is allowed.
    // Its origin, path, and query must still match the requested artifact exactly.
    await expect(page).toHaveURL(isExpectedArtifactUrl);
    await expect.poll(readContentUrl).toBe(
      new URL('apply.html?plan=free&dx=stress#trial', initialContentUrl).href,
    );

    // The artifact iframe navigates internally; its src attribute stays unchanged.
    const contentUrl = await readContentUrl();
    const destination = new URL(contentUrl);
    expect(destination.pathname).toMatch(/\/apply\.html$/);
    expect(destination.searchParams.get('plan')).toBe('free');
    expect(destination.searchParams.get('dx')).toBe('stress');
    expect(destination.hash).toBe('#trial');

    await testInfo.attach('arrival-urls', {
      body: JSON.stringify({ pageUrl: page.url(), contentUrl }, null, 2),
      contentType: 'application/json',
    });
    const screenshotPath = testInfo.outputPath('free-trial-arrival.png');
    await page.screenshot({ path: screenshotPath });
    await testInfo.attach('free-trial-arrival', {
      path: screenshotPath,
      contentType: 'image/png',
    });
    // Stop at the application form: do not fill fields or submit the form.
  });
});
