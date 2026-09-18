const { chromium } = require("playwright");

const routes = [
  "/",
  "/",
  "/vehicles",
  "/drivers",
  "/trips",
  "/fuel",
  "/maintenance",
  "/expenses",
  "/reports",
  "/customers",
  "/products",
  "/sales-orders",
  "/purchases",
  "/payments",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let passed = 0;
  let failed = 0;

  console.log("\n========================================");
  console.log("       FLEETFLOW FRONTEND SMOKE TEST");
  console.log("========================================\n");

  for (const route of routes) {
    try {
      const response = await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "commit",
        timeout: 30000,
      });

      await page.waitForTimeout(3000);

      const status = response?.status() ?? 0;

      if (status >= 200 && status < 400) {
        console.log(`OK   ${route.padEnd(25)} -> ${status}`);
        passed++;
      } else {
        console.log(`FAIL ${route.padEnd(25)} -> ${status}`);
        failed++;
      }
    } catch (error) {
      console.log(`FAIL ${route.padEnd(25)} -> TIMEOUT/ERROR`);
      failed++;
    }
  }

  console.log("\n========================================");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${routes.length}`);
  console.log("========================================\n");

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
