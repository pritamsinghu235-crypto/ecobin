import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke coverage for the mobile 3D path on the public landing page.
 *
 * What this guards against (the regression we just fixed): the capability gate
 * silently dropping mobile/touch devices to the static SVG instead of mounting
 * the `lite` WebGL scene. On mobile projects, a <canvas> appearing proves the
 * gate upgraded past `off`; the canvas `touch-action: pan-y` proves the
 * scroll-preservation fix is in place.
 *
 * NOT covered here (needs a real GPU / physical device): actual framerate and
 * drag-rotate "feel". Headless Chromium uses software WebGL (SwiftShader).
 *
 * /dashboard is intentionally not tested — it sits behind Supabase auth, so a
 * smoke test would just hit the /login redirect. The same gate code powers it.
 */

/** Collect uncaught exceptions + console.error, ignoring benign network 404s. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/favicon|404|net::ERR/i.test(text)) return; // benign asset noise
    errors.push(`console: ${text}`);
  });
  return errors;
}

test("landing hero mounts a WebGL canvas (gate upgrades past static fallback)", async ({
  page,
}) => {
  const errors = trackErrors(page);

  await page.goto("/");

  // The gate runs in a rAF after mount, then the scene chunk lazy-loads.
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20_000 });

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("canvas keeps vertical page scroll (touch-action: pan-y)", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20_000 });

  // R3F applies the <Canvas style> to its wrapper <div>, not the inner
  // <canvas>, so climb ancestors to find where pan-y was set.
  const hasPanY = await canvas.evaluate((el) => {
    let node: HTMLElement | null = el as HTMLElement;
    while (node) {
      if (getComputedStyle(node).touchAction === "pan-y") return true;
      node = node.parentElement;
    }
    return false;
  });
  expect(hasPanY).toBe(true);
});

test("tapping the model does not throw and the scene survives", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch interaction only meaningful on mobile projects");
  const errors = trackErrors(page);

  await page.goto("/");
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible({ timeout: 20_000 });

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Press near the center where the bin sits (press-and-hold spin boost path).
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.waitForTimeout(300);

  await expect(canvas).toBeVisible();
  expect(errors, errors.join("\n")).toHaveLength(0);
});
