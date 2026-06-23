import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config focused on the mobile 3D path. Headless Chromium has no real GPU,
 * so we force SwiftShader (software WebGL) — that's enough to prove the
 * capability gate upgrades to the `lite` 3D tier and mounts a <canvas>. It does
 * NOT measure real GPU framerate (verify that on a physical device).
 */
const webglArgs = [
  "--ignore-gpu-blocklist",
  "--enable-unsafe-swiftshader",
  "--use-gl=angle",
  "--use-angle=swiftshader",
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-pixel",
      use: { ...devices["Pixel 5"], launchOptions: { args: webglArgs } },
    },
    {
      // iPhone *viewport + touch*, but on Chromium: headless WebKit WebGL is
      // unreliable, and the gate we're testing is engine-agnostic. True Safari
      // rendering is validated on a physical device.
      name: "mobile-iphone",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        launchOptions: { args: webglArgs },
      },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], launchOptions: { args: webglArgs } },
    },
  ],
  // Reuse a dev server if one is already up; otherwise start it.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
