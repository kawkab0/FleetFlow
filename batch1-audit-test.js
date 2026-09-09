const BASE_URL = "http://localhost:3001";

const ADMIN_EMAIL = "admin@fleetflow.com";
const ADMIN_PASSWORD = "Admin@123";

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    status: response.status,
    data,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ ${message}`);
  }

  console.log(`✅ ${message}`);
}

async function main() {
  console.log("\n🔥 FleetFlow Batch 1 Audit Test\n");

  // ==========================================
  // LOGIN
  // ==========================================

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  console.log(`Login status: ${login.status}`);

  assert(login.status === 201, "Admin login");

  const token = login.data.accessToken;

  assert(!!token, "JWT token received");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================================
  // TRIPS
  // ==========================================

  console.log("\n🚚 TESTING TRIPS");

  const tripCode = `TEST-TRIP-${Date.now()}`;

  const trip = await request("/trips", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      tripCode,
      origin: "Jimma",
      destination: "Addis Ababa",
      vehicleCode: "VH-001",
      driverCode: "DRV-001",
      tripDate: "2026-09-08",
      distance: 350,
      fuelUsed: 45,
      revenue: 25000,
      cargo: "Test Cargo",
      status: "Planned",
      notes: "Automated audit test",
    }),
  });

  console.log(
    `POST /trips: ${trip.status}`,
    JSON.stringify(trip.data, null, 2),
  );

  assert(
    trip.status === 201,
    "Trip created",
  );

  const tripId = trip.data.id;

  const updatedTrip = await request(`/trips/${tripId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      status: "Completed",
    }),
  });

  console.log(
    `PATCH /trips/${tripId}: ${updatedTrip.status}`,
    JSON.stringify(updatedTrip.data, null, 2),
  );

  assert(
    updatedTrip.status === 200,
    "Trip updated",
  );

  const tripLogs = await request("/audit-logs/module/Trips", {
    headers: authHeaders,
  });

  assert(
    tripLogs.status === 200,
    "Trips audit endpoint",
  );

  const tripCreateLog = tripLogs.data.find(
    (log) =>
      log.recordId === tripId &&
      log.action === "CREATE",
  );

  const tripUpdateLog = tripLogs.data.find(
    (log) =>
      log.recordId === tripId &&
      log.action === "UPDATE",
  );

  assert(
    !!tripCreateLog,
    "Trip CREATE audit recorded",
  );

  assert(
    !!tripUpdateLog,
    "Trip UPDATE audit recorded",
  );

  const deletedTrip = await request(`/trips/${tripId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  console.log(
    `DELETE /trips/${tripId}: ${deletedTrip.status}`,
    JSON.stringify(deletedTrip.data, null, 2),
  );

  assert(
    deletedTrip.status === 200,
    "Trip deleted",
  );

  const tripDeleteLogs = await request("/audit-logs/module/Trips", {
    headers: authHeaders,
  });

  const tripDeleteLog = tripDeleteLogs.data.find(
    (log) =>
      log.recordId === tripId &&
      log.action === "DELETE",
  );

  assert(
    !!tripDeleteLog,
    "Trip DELETE audit recorded",
  );

  // ==========================================
  // FUEL
  // ==========================================

  console.log("\n⛽ TESTING FUEL");

  const fuelCode = `TEST-FUEL-${Date.now()}`;

  const fuel = await request("/fuel", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      fuelCode,
      vehicleCode: "VH-001",
      driverCode: "DRV-001",
      fuelDate: "2026-09-08",
      liters: 50,
      cost: 7500,
      fuelStation: "Test Fuel Station",
      odometer: 15000,
      paymentMethod: "Cash",
      notes: "Automated audit test",
    }),
  });

  console.log(
    `POST /fuel: ${fuel.status}`,
    JSON.stringify(fuel.data, null, 2),
  );

  assert(
    fuel.status === 201,
    "Fuel record created",
  );

  const fuelId = fuel.data.id;

  const updatedFuel = await request(`/fuel/${fuelId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      liters: 55,
    }),
  });

  console.log(
    `PATCH /fuel/${fuelId}: ${updatedFuel.status}`,
    JSON.stringify(updatedFuel.data, null, 2),
  );

  assert(
    updatedFuel.status === 200,
    "Fuel record updated",
  );

  const fuelLogs = await request("/audit-logs/module/Fuel", {
    headers: authHeaders,
  });

  assert(
    fuelLogs.status === 200,
    "Fuel audit endpoint",
  );

  assert(
    fuelLogs.data.some(
      (log) =>
        log.recordId === fuelId &&
        log.action === "CREATE",
    ),
    "Fuel CREATE audit recorded",
  );

  assert(
    fuelLogs.data.some(
      (log) =>
        log.recordId === fuelId &&
        log.action === "UPDATE",
    ),
    "Fuel UPDATE audit recorded",
  );

  const deletedFuel = await request(`/fuel/${fuelId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  console.log(
    `DELETE /fuel/${fuelId}: ${deletedFuel.status}`,
    JSON.stringify(deletedFuel.data, null, 2),
  );

  assert(
    deletedFuel.status === 200,
    "Fuel record deleted",
  );

  const fuelDeleteLogs = await request("/audit-logs/module/Fuel", {
    headers: authHeaders,
  });

  assert(
    fuelDeleteLogs.data.some(
      (log) =>
        log.recordId === fuelId &&
        log.action === "DELETE",
    ),
    "Fuel DELETE audit recorded",
  );

  // ==========================================
  // MAINTENANCE
  // ==========================================

  console.log("\n🔧 TESTING MAINTENANCE");

  const maintenanceCode = `TEST-MAINT-${Date.now()}`;

  const maintenance = await request("/maintenance", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      maintenanceCode,
      vehicleCode: "VH-001",
      maintenanceDate: "2026-09-08",
      maintenanceType: "Routine Service",
      description: "Automated audit test maintenance",
      mileage: 15000,
      cost: 5000,
      serviceProvider: "Test Service Center",
      status: "Pending",
      notes: "Automated audit test",
    }),
  });

  console.log(
    `POST /maintenance: ${maintenance.status}`,
    JSON.stringify(maintenance.data, null, 2),
  );

  assert(
    maintenance.status === 201,
    "Maintenance record created",
  );

  const maintenanceId = maintenance.data.id;

  const updatedMaintenance = await request(
    `/maintenance/${maintenanceId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        status: "Completed",
      }),
    },
  );

  console.log(
    `PATCH /maintenance/${maintenanceId}: ${updatedMaintenance.status}`,
    JSON.stringify(updatedMaintenance.data, null, 2),
  );

  assert(
    updatedMaintenance.status === 200,
    "Maintenance record updated",
  );

  const maintenanceLogs = await request(
    "/audit-logs/module/Maintenance",
    {
      headers: authHeaders,
    },
  );

  assert(
    maintenanceLogs.status === 200,
    "Maintenance audit endpoint",
  );

  assert(
    maintenanceLogs.data.some(
      (log) =>
        log.recordId === maintenanceId &&
        log.action === "CREATE",
    ),
    "Maintenance CREATE audit recorded",
  );

  assert(
    maintenanceLogs.data.some(
      (log) =>
        log.recordId === maintenanceId &&
        log.action === "UPDATE",
    ),
    "Maintenance UPDATE audit recorded",
  );

  const deletedMaintenance = await request(
    `/maintenance/${maintenanceId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /maintenance/${maintenanceId}: ${deletedMaintenance.status}`,
    JSON.stringify(deletedMaintenance.data, null, 2),
  );

  assert(
    deletedMaintenance.status === 200,
    "Maintenance record deleted",
  );

  const maintenanceDeleteLogs = await request(
    "/audit-logs/module/Maintenance",
    {
      headers: authHeaders,
    },
  );

  assert(
    maintenanceDeleteLogs.data.some(
      (log) =>
        log.recordId === maintenanceId &&
        log.action === "DELETE",
    ),
    "Maintenance DELETE audit recorded",
  );

  // ==========================================
  // EXPENSES
  // ==========================================

  console.log("\n💰 TESTING EXPENSES");

  const expenseCode = `TEST-EXP-${Date.now()}`;

  const expense = await request("/expenses", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      expenseCode,
      vehicleCode: "VH-001",
      driverCode: "DRV-001",
      expenseDate: "2026-09-08",
      category: "Fuel",
      description: "Automated audit test expense",
      amount: 3000,
      vendor: "Test Vendor",
      paymentMethod: "Cash",
      status: "Paid",
      notes: "Automated audit test",
    }),
  });

  console.log(
    `POST /expenses: ${expense.status}`,
    JSON.stringify(expense.data, null, 2),
  );

  assert(
    expense.status === 201,
    "Expense created",
  );

  const expenseId = expense.data.id;

  const updatedExpense = await request(
    `/expenses/${expenseId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        amount: 3500,
      }),
    },
  );

  console.log(
    `PATCH /expenses/${expenseId}: ${updatedExpense.status}`,
    JSON.stringify(updatedExpense.data, null, 2),
  );

  assert(
    updatedExpense.status === 200,
    "Expense updated",
  );

  const expenseLogs = await request(
    "/audit-logs/module/Expenses",
    {
      headers: authHeaders,
    },
  );

  assert(
    expenseLogs.status === 200,
    "Expenses audit endpoint",
  );

  assert(
    expenseLogs.data.some(
      (log) =>
        log.recordId === expenseId &&
        log.action === "CREATE",
    ),
    "Expense CREATE audit recorded",
  );

  assert(
    expenseLogs.data.some(
      (log) =>
        log.recordId === expenseId &&
        log.action === "UPDATE",
    ),
    "Expense UPDATE audit recorded",
  );

  const deletedExpense = await request(
    `/expenses/${expenseId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /expenses/${expenseId}: ${deletedExpense.status}`,
    JSON.stringify(deletedExpense.data, null, 2),
  );

  assert(
    deletedExpense.status === 200,
    "Expense deleted",
  );

  const expenseDeleteLogs = await request(
    "/audit-logs/module/Expenses",
    {
      headers: authHeaders,
    },
  );

  assert(
    expenseDeleteLogs.data.some(
      (log) =>
        log.recordId === expenseId &&
        log.action === "DELETE",
    ),
    "Expense DELETE audit recorded",
  );

  // ==========================================
  // FINAL RESULT
  // ==========================================

  console.log("\n🔥 EVERYTHING PASSED.");
  console.log("🔥 Batch 1 audit logging is GOOD.");
}

main().catch((error) => {
  console.error("\n💥 BATCH 1 TEST FAILED");
  console.error(error.message);
  process.exit(1);
});
