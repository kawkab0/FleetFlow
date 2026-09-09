const BASE_URL = "http://localhost:3001";

const ADMIN_EMAIL = "admin@fleetflow.com";
const ADMIN_PASSWORD = "Admin@123";

let token = "";

async function request(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

async function getAuditLogs(module, recordId) {
  const result = await request(
    `/audit-logs/module/${encodeURIComponent(module)}`,
  );

  assert(result.status === 200, `${module} audit endpoint`);

  return result.data.filter((log) => log.recordId === recordId);
}

async function testCustomers() {
  console.log("\n👤 TESTING CUSTOMERS");

  const create = await request("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: "Batch 3 Test Customer",
      email: "batch3.customer@fleetflow.com",
      phone: "+251911000001",
      address: "Batch 3 Test Address",
      city: "Jimma",
      country: "Ethiopia",
      region: "Africa",
      isActive: true,
    }),
  });

  console.log("POST /customers:", create.status, create.data);

  assert(create.status === 201, "Customer created");

  const customerId = create.data.id;

  const update = await request(`/customers/${customerId}`, {
    method: "PATCH",
    body: JSON.stringify({
      phone: "+251911000002",
    }),
  });

  console.log("PATCH /customers/:id:", update.status, update.data);

  assert(update.status === 200, "Customer updated");

  const logsAfterUpdate = await getAuditLogs("Customers", customerId);

  assert(
    logsAfterUpdate.some((log) => log.action === "CREATE"),
    "Customer CREATE audit recorded",
  );

  assert(
    logsAfterUpdate.some((log) => log.action === "UPDATE"),
    "Customer UPDATE audit recorded",
  );

  const remove = await request(`/customers/${customerId}`, {
    method: "DELETE",
  });

  console.log("DELETE /customers/:id:", remove.status, remove.data);

  assert(remove.status === 200, "Customer deleted");

  const logsAfterDelete = await getAuditLogs("Customers", customerId);

  assert(
    logsAfterDelete.some((log) => log.action === "DELETE"),
    "Customer DELETE audit recorded",
  );
}

async function testSalesOrderAndChildren() {
  console.log("\n🧾 TESTING SALES ORDERS");

  const customers = await request("/customers");
  assert(customers.status === 200, "Customers available");

  if (!customers.data.length) {
    throw new Error("❌ No customer exists for Sales Order test.");
  }

  const products = await request("/products");
  assert(products.status === 200, "Products available");

  if (!products.data.length) {
    throw new Error("❌ No product exists for Sales Order test.");
  }

  const customerId = customers.data[0].id;
  const productId = products.data[0].id;

  const create = await request("/sales-orders", {
    method: "POST",
    body: JSON.stringify({
      customerId,
      orderDate: "2026-09-09",
      totalAmount: 2000,
      status: "Pending",
      shippingAddress: "Jimma, Ethiopia",
      notes: "Batch 3 audit test",
    }),
  });

  console.log("POST /sales-orders:", create.status, create.data);

  assert(create.status === 201, "Sales Order created");

  const salesOrderId = create.data.id;

  const update = await request(`/sales-orders/${salesOrderId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Completed",
      totalAmount: 2200,
    }),
  });

  console.log("PATCH /sales-orders/:id:", update.status, update.data);

  assert(update.status === 200, "Sales Order updated");

  let logs = await getAuditLogs("Sales Orders", salesOrderId);

  assert(
    logs.some((log) => log.action === "CREATE"),
    "Sales Order CREATE audit recorded",
  );

  assert(
    logs.some((log) => log.action === "UPDATE"),
    "Sales Order UPDATE audit recorded",
  );

  console.log("\n📦 TESTING SALES ORDER DETAILS");

  const detailCreate = await request("/sales-order-details", {
    method: "POST",
    body: JSON.stringify({
      salesOrderId,
      productId,
      quantity: 2,
      unitPrice: 1000,
      totalPrice: 2000,
    }),
  });

  console.log(
    "POST /sales-order-details:",
    detailCreate.status,
    detailCreate.data,
  );

  assert(detailCreate.status === 201, "Sales Order Detail created");

  const detailId = detailCreate.data.id;

  const detailUpdate = await request(`/sales-order-details/${detailId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity: 3,
      totalPrice: 3000,
    }),
  });

  console.log(
    "PATCH /sales-order-details/:id:",
    detailUpdate.status,
    detailUpdate.data,
  );

  assert(detailUpdate.status === 200, "Sales Order Detail updated");

  logs = await getAuditLogs("Sales Order Details", detailId);

  assert(
    logs.some((log) => log.action === "CREATE"),
    "Sales Order Detail CREATE audit recorded",
  );

  assert(
    logs.some((log) => log.action === "UPDATE"),
    "Sales Order Detail UPDATE audit recorded",
  );

  const detailDelete = await request(`/sales-order-details/${detailId}`, {
    method: "DELETE",
  });

  console.log(
    "DELETE /sales-order-details/:id:",
    detailDelete.status,
    detailDelete.data,
  );

  assert(detailDelete.status === 200, "Sales Order Detail deleted");

  logs = await getAuditLogs("Sales Order Details", detailId);

  assert(
    logs.some((log) => log.action === "DELETE"),
    "Sales Order Detail DELETE audit recorded",
  );

  console.log("\n💳 TESTING PAYMENTS");

  const paymentCreate = await request("/payments", {
    method: "POST",
    body: JSON.stringify({
      salesOrderId,
      amount: 2200,
      paymentDate: "2026-09-09",
      status: "Pending",
      paymentMethod: "Cash",
      referenceNumber: "BATCH3-PAY-001",
      notes: "Batch 3 audit test",
    }),
  });

  console.log("POST /payments:", paymentCreate.status, paymentCreate.data);

  assert(paymentCreate.status === 201, "Payment created");

  const paymentId = paymentCreate.data.id;

  const paymentUpdate = await request(`/payments/${paymentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Completed",
      amount: 2200,
    }),
  });

  console.log(
    "PATCH /payments/:id:",
    paymentUpdate.status,
    paymentUpdate.data,
  );

  assert(paymentUpdate.status === 200, "Payment updated");

  logs = await getAuditLogs("Payments", paymentId);

  assert(
    logs.some((log) => log.action === "CREATE"),
    "Payment CREATE audit recorded",
  );

  assert(
    logs.some((log) => log.action === "UPDATE"),
    "Payment UPDATE audit recorded",
  );

  const paymentDelete = await request(`/payments/${paymentId}`, {
    method: "DELETE",
  });

  console.log(
    "DELETE /payments/:id:",
    paymentDelete.status,
    paymentDelete.data,
  );

  assert(paymentDelete.status === 200, "Payment deleted");

  logs = await getAuditLogs("Payments", paymentId);

  assert(
    logs.some((log) => log.action === "DELETE"),
    "Payment DELETE audit recorded",
  );

  const salesOrderDelete = await request(`/sales-orders/${salesOrderId}`, {
    method: "DELETE",
  });

  console.log(
    "DELETE /sales-orders/:id:",
    salesOrderDelete.status,
    salesOrderDelete.data,
  );

  assert(salesOrderDelete.status === 200, "Sales Order deleted");

  logs = await getAuditLogs("Sales Orders", salesOrderId);

  assert(
    logs.some((log) => log.action === "DELETE"),
    "Sales Order DELETE audit recorded",
  );
}

async function testPurchaseAndDetails() {
  console.log("\n🛒 TESTING PURCHASES");

  const suppliers = await request("/suppliers");
  assert(suppliers.status === 200, "Suppliers available");

  if (!suppliers.data.length) {
    throw new Error("❌ No supplier exists for Purchase test.");
  }

  const warehouses = await request("/warehouses");
  assert(warehouses.status === 200, "Warehouses available");

  if (!warehouses.data.length) {
    throw new Error("❌ No warehouse exists for Purchase test.");
  }

  const products = await request("/products");
  assert(products.status === 200, "Products available");

  if (!products.data.length) {
    throw new Error("❌ No product exists for Purchase Detail test.");
  }

  const supplierId = suppliers.data[0].id;
  const warehouseId = warehouses.data[0].id;
  const productId = products.data[0].id;

  const create = await request("/purchases", {
    method: "POST",
    body: JSON.stringify({
      supplierId,
      warehouseId,
      purchaseDate: "2026-09-09",
      totalAmount: 2000,
      status: "Pending",
      referenceNumber: "BATCH3-PO-001",
      notes: "Batch 3 audit test",
    }),
  });

  console.log("POST /purchases:", create.status, create.data);

  assert(create.status === 201, "Purchase created");

  const purchaseId = create.data.id;

  const update = await request(`/purchases/${purchaseId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Received",
      totalAmount: 2200,
    }),
  });

  console.log("PATCH /purchases/:id:", update.status, update.data);

  assert(update.status === 200, "Purchase updated");

  let logs = await getAuditLogs("Purchases", purchaseId);

  assert(
    logs.some((log) => log.action === "CREATE"),
    "Purchase CREATE audit recorded",
  );

  assert(
    logs.some((log) => log.action === "UPDATE"),
    "Purchase UPDATE audit recorded",
  );

  console.log("\n📦 TESTING PURCHASE DETAILS");

  const detailCreate = await request("/purchase-details", {
    method: "POST",
    body: JSON.stringify({
      purchaseId,
      productId,
      quantity: 4,
      unitPrice: 500,
      totalPrice: 2000,
    }),
  });

  console.log(
    "POST /purchase-details:",
    detailCreate.status,
    detailCreate.data,
  );

  assert(detailCreate.status === 201, "Purchase Detail created");

  const detailId = detailCreate.data.id;

  const detailUpdate = await request(`/purchase-details/${detailId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity: 5,
      totalPrice: 2500,
    }),
  });

  console.log(
    "PATCH /purchase-details/:id:",
    detailUpdate.status,
    detailUpdate.data,
  );

  assert(detailUpdate.status === 200, "Purchase Detail updated");

  logs = await getAuditLogs("Purchase Details", detailId);

  assert(
    logs.some((log) => log.action === "CREATE"),
    "Purchase Detail CREATE audit recorded",
  );

  assert(
    logs.some((log) => log.action === "UPDATE"),
    "Purchase Detail UPDATE audit recorded",
  );

  const detailDelete = await request(`/purchase-details/${detailId}`, {
    method: "DELETE",
  });

  console.log(
    "DELETE /purchase-details/:id:",
    detailDelete.status,
    detailDelete.data,
  );

  assert(detailDelete.status === 200, "Purchase Detail deleted");

  logs = await getAuditLogs("Purchase Details", detailId);

  assert(
    logs.some((log) => log.action === "DELETE"),
    "Purchase Detail DELETE audit recorded",
  );

  const purchaseDelete = await request(`/purchases/${purchaseId}`, {
    method: "DELETE",
  });

  console.log(
    "DELETE /purchases/:id:",
    purchaseDelete.status,
    purchaseDelete.data,
  );

  assert(purchaseDelete.status === 200, "Purchase deleted");

  logs = await getAuditLogs("Purchases", purchaseId);

  assert(
    logs.some((log) => log.action === "DELETE"),
    "Purchase DELETE audit recorded",
  );
}

async function main() {
  console.log("🔥 FleetFlow Batch 3 Audit Test\n");

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });

  console.log("Login status:", login.status);

  assert(login.status === 201, "Admin login");

  token = login.data.accessToken;

  assert(token, "JWT token received");

  await testCustomers();
  await testSalesOrderAndChildren();
  await testPurchaseAndDetails();

  console.log("\n🔥 EVERYTHING PASSED.");
  console.log("🔥 Batch 3 audit logging is GOOD.");
}

main().catch((error) => {
  console.error("\n💥 TEST FAILED");
  console.error(error.message);
  process.exit(1);
});
