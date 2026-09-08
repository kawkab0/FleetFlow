const BASE_URL = "http://localhost:3001";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return {
    status: response.status,
    data,
  };
}

async function main() {
  console.log("\n🔥 FleetFlow Driver Audit Test\n");

  // LOGIN
  const login = await request(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({
      email: "admin@fleetflow.com",
      password: "Admin123!",
    }),
  });

  console.log("Login status:", login.status);

  if (login.status !== 201) {
    console.log("❌ Admin login failed");
    console.log(login.data);
    return;
  }

  console.log("✅ Admin login");

  const token = login.data.accessToken;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // GET DRIVERS
  const drivers = await request(`${BASE_URL}/drivers`, {
    headers: authHeaders,
  });

  console.log("GET /drivers:", drivers.status);

  if (drivers.status !== 200) {
    console.log("❌ Drivers API failed");
    console.log(drivers.data);
    return;
  }

  console.log("✅ Drivers API");

  // CREATE DRIVER
  const create = await request(`${BASE_URL}/drivers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      driverCode: `AUDIT-${Date.now()}`,
      name: "Audit Test Driver",
      phone: "0911111111",
      licenseNumber: "AUDIT-TEST-001",
      licenseType: "Professional",
      status: "Active",
      hireDate: "2026-01-01",
      assignedVehicle: null,
    }),
  });

  console.log("POST /drivers:", create.status);

  if (![200, 201].includes(create.status)) {
    console.log("❌ Driver creation failed");
    console.log(create.data);
    return;
  }

  console.log("✅ Driver created");

  const driverId = create.data.id;

  // UPDATE DRIVER
  const update = await request(
    `${BASE_URL}/drivers/${driverId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        phone: "0922222222",
      }),
    },
  );

  console.log("PATCH /drivers/:id:", update.status);

  if (update.status !== 200) {
    console.log("❌ Driver update failed");
    console.log(update.data);
    return;
  }

  console.log("✅ Driver updated");

  // CHECK CREATE + UPDATE AUDITS
  const audits = await request(
    `${BASE_URL}/audit-logs/module/Drivers`,
    {
      headers: authHeaders,
    },
  );

  console.log(
    "GET /audit-logs/module/Drivers:",
    audits.status,
  );

  if (audits.status !== 200) {
    console.log("❌ Driver audit API failed");
    console.log(audits.data);
    return;
  }

  const driverAudits = audits.data.filter(
    (log) => log.recordId === driverId,
  );

  const hasCreate = driverAudits.some(
    (log) => log.action === "CREATE",
  );

  const hasUpdate = driverAudits.some(
    (log) => log.action === "UPDATE",
  );

  console.log(
    `Audit records for driver #${driverId}:`,
    driverAudits.length,
  );

  console.log(
    hasCreate
      ? "✅ CREATE audit recorded"
      : "❌ CREATE audit missing",
  );

  console.log(
    hasUpdate
      ? "✅ UPDATE audit recorded"
      : "❌ UPDATE audit missing",
  );

  // DELETE DRIVER
  const remove = await request(
    `${BASE_URL}/drivers/${driverId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log("DELETE /drivers/:id:", remove.status);

  if (![200, 204].includes(remove.status)) {
    console.log("❌ Driver deletion failed");
    console.log(remove.data);
    return;
  }

  console.log("✅ Test driver deleted");

  // CHECK DELETE AUDIT
  const finalAudits = await request(
    `${BASE_URL}/audit-logs/module/Drivers`,
    {
      headers: authHeaders,
    },
  );

  const finalDriverAudits = finalAudits.data.filter(
    (log) => log.recordId === driverId,
  );

  const hasDelete = finalDriverAudits.some(
    (log) => log.action === "DELETE",
  );

  console.log(
    hasDelete
      ? "✅ DELETE audit recorded"
      : "❌ DELETE audit missing",
  );

  if (hasCreate && hasUpdate && hasDelete) {
    console.log("\n🔥 EVERYTHING PASSED.");
    console.log("🔥 Driver audit logging is GOOD.\n");
  } else {
    console.log("\n❌ Driver audit test FAILED.\n");
  }
}

main().catch((error) => {
  console.error("\n❌ Test crashed:");
  console.error(error);
});
