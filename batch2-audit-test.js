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
  console.log("\n🔥 FleetFlow Batch 2 Audit Test\n");

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
  // PRODUCTS
  // ==========================================

  console.log("\n📦 TESTING PRODUCTS");

  const productName = `TEST PRODUCT ${Date.now()}`;

  const product = await request("/products", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: productName,
      description: "Automated audit test product",
      price: 1500,
      stock: 25,
      category: "Electronics",
      supplierId: null,
      isActive: true,
    }),
  });

  console.log(
    `POST /products: ${product.status}`,
    JSON.stringify(product.data, null, 2),
  );

  assert(product.status === 201, "Product created");

  const productId = product.data.id;

  const updatedProduct = await request(`/products/${productId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      price: 1750,
      stock: 30,
    }),
  });

  console.log(
    `PATCH /products/${productId}: ${updatedProduct.status}`,
    JSON.stringify(updatedProduct.data, null, 2),
  );

  assert(updatedProduct.status === 200, "Product updated");

  const productLogs = await request(
    "/audit-logs/module/Products",
    {
      headers: authHeaders,
    },
  );

  assert(
    productLogs.status === 200,
    "Products audit endpoint",
  );

  assert(
    productLogs.data.some(
      (log) =>
        log.recordId === productId &&
        log.action === "CREATE",
    ),
    "Product CREATE audit recorded",
  );

  assert(
    productLogs.data.some(
      (log) =>
        log.recordId === productId &&
        log.action === "UPDATE",
    ),
    "Product UPDATE audit recorded",
  );

  const deletedProduct = await request(
    `/products/${productId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /products/${productId}: ${deletedProduct.status}`,
    JSON.stringify(deletedProduct.data, null, 2),
  );

  assert(
    deletedProduct.status === 200,
    "Product deleted",
  );

  const productDeleteLogs = await request(
    "/audit-logs/module/Products",
    {
      headers: authHeaders,
    },
  );

  assert(
    productDeleteLogs.data.some(
      (log) =>
        log.recordId === productId &&
        log.action === "DELETE",
    ),
    "Product DELETE audit recorded",
  );

  // ==========================================
  // SUPPLIERS
  // ==========================================

  console.log("\n🏢 TESTING SUPPLIERS");

  const supplierName = `TEST SUPPLIER ${Date.now()}`;

  const supplier = await request("/suppliers", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: supplierName,
      contactPerson: "Test Contact",
      email: `test-${Date.now()}@fleetflow.com`,
      phone: "0911000000",
      address: "Test Address",
      isActive: true,
    }),
  });

  console.log(
    `POST /suppliers: ${supplier.status}`,
    JSON.stringify(supplier.data, null, 2),
  );

  assert(
    supplier.status === 201,
    "Supplier created",
  );

  const supplierId = supplier.data.id;

  const updatedSupplier = await request(
    `/suppliers/${supplierId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        contactPerson: "Updated Test Contact",
      }),
    },
  );

  console.log(
    `PATCH /suppliers/${supplierId}: ${updatedSupplier.status}`,
    JSON.stringify(updatedSupplier.data, null, 2),
  );

  assert(
    updatedSupplier.status === 200,
    "Supplier updated",
  );

  const supplierLogs = await request(
    "/audit-logs/module/Suppliers",
    {
      headers: authHeaders,
    },
  );

  assert(
    supplierLogs.status === 200,
    "Suppliers audit endpoint",
  );

  assert(
    supplierLogs.data.some(
      (log) =>
        log.recordId === supplierId &&
        log.action === "CREATE",
    ),
    "Supplier CREATE audit recorded",
  );

  assert(
    supplierLogs.data.some(
      (log) =>
        log.recordId === supplierId &&
        log.action === "UPDATE",
    ),
    "Supplier UPDATE audit recorded",
  );

  const deletedSupplier = await request(
    `/suppliers/${supplierId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /suppliers/${supplierId}: ${deletedSupplier.status}`,
    JSON.stringify(deletedSupplier.data, null, 2),
  );

  assert(
    deletedSupplier.status === 200,
    "Supplier deleted",
  );

  const supplierDeleteLogs = await request(
    "/audit-logs/module/Suppliers",
    {
      headers: authHeaders,
    },
  );

  assert(
    supplierDeleteLogs.data.some(
      (log) =>
        log.recordId === supplierId &&
        log.action === "DELETE",
    ),
    "Supplier DELETE audit recorded",
  );

  // ==========================================
  // WAREHOUSES
  // ==========================================

  console.log("\n🏭 TESTING WAREHOUSES");

  const warehouseName = `TEST WAREHOUSE ${Date.now()}`;

  const warehouse = await request("/warehouses", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: warehouseName,
      address: "Test Warehouse Address",
      city: "Jimma",
      country: "Ethiopia",
      manager: "Test Manager",
      phone: "0911000000",
      isActive: true,
    }),
  });

  console.log(
    `POST /warehouses: ${warehouse.status}`,
    JSON.stringify(warehouse.data, null, 2),
  );

  assert(
    warehouse.status === 201,
    "Warehouse created",
  );

  const warehouseId = warehouse.data.id;

  const updatedWarehouse = await request(
    `/warehouses/${warehouseId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        manager: "Updated Test Manager",
      }),
    },
  );

  console.log(
    `PATCH /warehouses/${warehouseId}: ${updatedWarehouse.status}`,
    JSON.stringify(updatedWarehouse.data, null, 2),
  );

  assert(
    updatedWarehouse.status === 200,
    "Warehouse updated",
  );

  const warehouseLogs = await request(
    "/audit-logs/module/Warehouses",
    {
      headers: authHeaders,
    },
  );

  assert(
    warehouseLogs.status === 200,
    "Warehouses audit endpoint",
  );

  assert(
    warehouseLogs.data.some(
      (log) =>
        log.recordId === warehouseId &&
        log.action === "CREATE",
    ),
    "Warehouse CREATE audit recorded",
  );

  assert(
    warehouseLogs.data.some(
      (log) =>
        log.recordId === warehouseId &&
        log.action === "UPDATE",
    ),
    "Warehouse UPDATE audit recorded",
  );

  const deletedWarehouse = await request(
    `/warehouses/${warehouseId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /warehouses/${warehouseId}: ${deletedWarehouse.status}`,
    JSON.stringify(deletedWarehouse.data, null, 2),
  );

  assert(
    deletedWarehouse.status === 200,
    "Warehouse deleted",
  );

  const warehouseDeleteLogs = await request(
    "/audit-logs/module/Warehouses",
    {
      headers: authHeaders,
    },
  );

  assert(
    warehouseDeleteLogs.data.some(
      (log) =>
        log.recordId === warehouseId &&
        log.action === "DELETE",
    ),
    "Warehouse DELETE audit recorded",
  );

  // ==========================================
  // INVENTORY
  // ==========================================

  console.log("\n📊 TESTING INVENTORY");

  // Use existing Product and Warehouse records.
  const existingProducts = await request(
    "/products",
    {
      headers: authHeaders,
    },
  );

  assert(
    existingProducts.status === 200,
    "Products available for inventory test",
  );

  const existingWarehouses = await request(
    "/warehouses",
    {
      headers: authHeaders,
    },
  );

  assert(
    existingWarehouses.status === 200,
    "Warehouses available for inventory test",
  );

  const existingProduct = existingProducts.data.find(
    (item) => item.id,
  );

  const existingWarehouse = existingWarehouses.data.find(
    (item) => item.id,
  );

  assert(
    !!existingProduct,
    "Existing product found for inventory test",
  );

  assert(
    !!existingWarehouse,
    "Existing warehouse found for inventory test",
  );

  const inventory = await request("/inventory", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      productId: existingProduct.id,
      warehouseId: existingWarehouse.id,
      quantity: 100,
      reorderLevel: 20,
      isActive: true,
    }),
  });

  console.log(
    `POST /inventory: ${inventory.status}`,
    JSON.stringify(inventory.data, null, 2),
  );

  assert(
    inventory.status === 201,
    "Inventory record created",
  );

  const inventoryId = inventory.data.id;

  const updatedInventory = await request(
    `/inventory/${inventoryId}`,
    {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 125,
      }),
    },
  );

  console.log(
    `PATCH /inventory/${inventoryId}: ${updatedInventory.status}`,
    JSON.stringify(updatedInventory.data, null, 2),
  );

  assert(
    updatedInventory.status === 200,
    "Inventory record updated",
  );

  const inventoryLogs = await request(
    "/audit-logs/module/Inventory",
    {
      headers: authHeaders,
    },
  );

  assert(
    inventoryLogs.status === 200,
    "Inventory audit endpoint",
  );

  assert(
    inventoryLogs.data.some(
      (log) =>
        log.recordId === inventoryId &&
        log.action === "CREATE",
    ),
    "Inventory CREATE audit recorded",
  );

  assert(
    inventoryLogs.data.some(
      (log) =>
        log.recordId === inventoryId &&
        log.action === "UPDATE",
    ),
    "Inventory UPDATE audit recorded",
  );

  const deletedInventory = await request(
    `/inventory/${inventoryId}`,
    {
      method: "DELETE",
      headers: authHeaders,
    },
  );

  console.log(
    `DELETE /inventory/${inventoryId}: ${deletedInventory.status}`,
    JSON.stringify(deletedInventory.data, null, 2),
  );

  assert(
    deletedInventory.status === 200,
    "Inventory record deleted",
  );

  const inventoryDeleteLogs = await request(
    "/audit-logs/module/Inventory",
    {
      headers: authHeaders,
    },
  );

  assert(
    inventoryDeleteLogs.data.some(
      (log) =>
        log.recordId === inventoryId &&
        log.action === "DELETE",
    ),
    "Inventory DELETE audit recorded",
  );

  // ==========================================
  // FINAL RESULT
  // ==========================================

  console.log("\n🔥 EVERYTHING PASSED.");
  console.log("🔥 Batch 2 audit logging is GOOD.");
}

main().catch((error) => {
  console.error("\n💥 BATCH 2 TEST FAILED");
  console.error(error.message);
  process.exit(1);
});
