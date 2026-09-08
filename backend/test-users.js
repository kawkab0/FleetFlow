const BASE_URL = "http://localhost:3001";

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
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

async function run() {
  console.log("\n🔥 FleetFlow User Management API Test\n");

  // 1. Login as Admin
  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@fleetflow.com",
      password: "Admin123!",
    }),
  });

  console.log("Login status:", login.status);

  if (login.status !== 201) {
    console.log("Login response:", login.data);
    throw new Error("Admin login failed");
  }

  const token = login.data.accessToken;

  console.log("✅ Admin login");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // 2. Get users
  const users = await request("/users", {
    headers: authHeaders,
  });

  if (users.status !== 200) {
    console.log("GET /users status:", users.status);
    console.log("GET /users response:", users.data);
    throw new Error("GET /users failed");
  }

  console.log("✅ GET /users");

  // 3. Create user
  const create = await request("/users", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Test Operations User",
      email: "test.operations@fleetflow.com",
      password: "TestUser123!",
      role: "Operations",
    }),
  });

  if (create.status !== 201) {
    console.log("POST /users status:", create.status);
    console.log("POST /users response:", create.data);
    throw new Error("POST /users failed");
  }

  const userId = create.data.id;

  console.log(`✅ POST /users → Created user #${userId}`);

  // 4. Update user
  const update = await request(`/users/${userId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Updated Operations User",
    }),
  });

  if (update.status !== 200) {
    console.log("PATCH /users/:id status:", update.status);
    console.log("PATCH /users/:id response:", update.data);
    throw new Error("PATCH /users/:id failed");
  }

  console.log("✅ PATCH /users/:id");

  // 5. Change password
  const password = await request(`/users/${userId}/password`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      password: "NewTestUser123!",
    }),
  });

  if (password.status !== 200) {
    console.log(
      "PATCH /users/:id/password status:",
      password.status,
    );
    console.log(
      "PATCH /users/:id/password response:",
      password.data,
    );
    throw new Error("PATCH /users/:id/password failed");
  }

  console.log("✅ PATCH /users/:id/password");

  // 6. Deactivate user
  const deactivate = await request(`/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      isActive: false,
    }),
  });

  if (deactivate.status !== 200) {
    console.log(
      "PATCH /users/:id/status status:",
      deactivate.status,
    );
    console.log(
      "PATCH /users/:id/status response:",
      deactivate.data,
    );
    throw new Error("Deactivate user failed");
  }

  console.log("✅ PATCH /users/:id/status → Deactivated");

  // 7. Reactivate user
  const activate = await request(`/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      isActive: true,
    }),
  });

  if (activate.status !== 200) {
    console.log(
      "PATCH /users/:id/status status:",
      activate.status,
    );
    console.log(
      "PATCH /users/:id/status response:",
      activate.data,
    );
    throw new Error("Reactivate user failed");
  }

  console.log("✅ PATCH /users/:id/status → Reactivated");

  // 8. Delete test user
  const remove = await request(`/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders,
  });

  if (remove.status !== 200) {
    console.log("DELETE /users/:id status:", remove.status);
    console.log("DELETE /users/:id response:", remove.data);
    throw new Error("DELETE /users/:id failed");
  }

  console.log("✅ DELETE /users/:id");

  console.log("\n🔥 EVERYTHING PASSED.");
  console.log("FleetFlow User Management API is GOOD. 🚀\n");
}

run().catch((error) => {
  console.error("\n❌ TEST FAILED");
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});
