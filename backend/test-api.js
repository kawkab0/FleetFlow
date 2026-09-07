const BASE_URL = "http://localhost:3001";

let token = "";

const results = [];

async function request(method, endpoint, body = null) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      // No JSON response.
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      data: {
        error: error.message,
      },
    };
  }
}

async function testEndpoint(method, endpoint, expected = [200]) {
  const result = await request(method, endpoint);

  const passed = expected.includes(result.status);

  results.push({
    method,
    endpoint,
    status: result.status,
    passed,
  });

  if (passed) {
    console.log(`✅ ${method.padEnd(6)} ${endpoint} → ${result.status}`);
  } else {
    console.log(`❌ ${method.padEnd(6)} ${endpoint} → ${result.status}`);
    console.log("   ", result.data);
  }
}

async function login() {
  console.log("\n🔐 Logging in...\n");

  const result = await request("POST", "/auth/login", {
    email: "admin@fleetflow.com",
    password: "Admin123!",
  });

  console.log("Login response:");
  console.log(result.data);

  if (![200, 201].includes(result.status)) {
    console.log("\n❌ Login request failed.");
    console.log(`HTTP status: ${result.status}`);
    process.exit(1);
  }

  token =
    result.data?.accessToken ||
    result.data?.access_token ||
    result.data?.token ||
    result.data?.jwt;

  if (!token) {
    console.log("\n❌ Login succeeded, but no JWT token was found.");
    console.log("Check the login response above.");
    process.exit(1);
  }

  console.log("\n✅ Admin login successful");
  console.log(`👤 User: ${result.data.user?.name || "Unknown"}`);
  console.log(`🛡️ Role: ${result.data.user?.role || "Unknown"}`);
  console.log("🔑 JWT token detected\n");
}

async function runTests() {
  console.log("========================================");
  console.log("       FLEETFLOW API SMOKE TEST");
  console.log("========================================");

  await login();

  console.log("📦 Core Modules\n");

  await testEndpoint("GET", "/vehicles");
  await testEndpoint("GET", "/drivers");
  await testEndpoint("GET", "/trips");
  await testEndpoint("GET", "/fuel");
  await testEndpoint("GET", "/maintenance");
  await testEndpoint("GET", "/expenses");

  console.log("\n📦 Sales & Customers\n");

  await testEndpoint("GET", "/customers");
  await testEndpoint("GET", "/products");
  await testEndpoint("GET", "/sales-orders");
  await testEndpoint("GET", "/sales-order-details");
  await testEndpoint("GET", "/payments");

  console.log("\n📦 Inventory & Procurement\n");

  await testEndpoint("GET", "/suppliers");
  await testEndpoint("GET", "/warehouses");
  await testEndpoint("GET", "/inventory");
  await testEndpoint("GET", "/purchases");
  await testEndpoint("GET", "/purchase-details");

  console.log("\n📊 Reports\n");

  await testEndpoint("GET", "/reports/fleet");
  await testEndpoint("GET", "/reports/trips");
  await testEndpoint("GET", "/reports/fuel");
  await testEndpoint("GET", "/reports/maintenance");
  await testEndpoint("GET", "/reports/expenses");

  console.log("\n📈 Analytics\n");

  await testEndpoint("GET", "/analytics/kpis");
  await testEndpoint("GET", "/analytics/vehicles");
  await testEndpoint("GET", "/analytics/expenses");
  await testEndpoint("GET", "/analytics/monthly");

  console.log("\n🧠 Intelligence\n");

  await testEndpoint("GET", "/intelligence");
  await testEndpoint("GET", "/profitability");
  await testEndpoint("GET", "/fuel-intelligence");
  await testEndpoint("GET", "/maintenance-intelligence");
  await testEndpoint("GET", "/recommendations");
  await testEndpoint("GET", "/alerts");
  await testEndpoint("GET", "/route-intelligence");
  await testEndpoint("GET", "/driver-intelligence");

  console.log("\n========================================");
  console.log("              TEST SUMMARY");
  console.log("========================================");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${results.length}`);

  if (failed === 0) {
    console.log("\n🔥 EVERYTHING PASSED.");
    console.log("FleetFlow backend is looking GOOD.\n");
  } else {
    console.log("\n⚠️ SOME ENDPOINTS FAILED.");
    console.log("Fix those before moving to final polish.\n");

    console.log("Failed endpoints:");

    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`❌ ${r.method} ${r.endpoint} → ${r.status}`);
      });
  }
}

runTests();
