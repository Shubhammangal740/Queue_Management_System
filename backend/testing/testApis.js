/**
 * Automated API Testing Script
 * Tests all Queue Management System APIs sequentially
 *
 * Usage: node testing/testApis.js
 *
 * Prerequisites:
 * 1. Server running on http://localhost:5000
 * 2. Database seeded (node testing/seed.js)
 * 3. axios installed (npm install axios)
 */

const axios = require("axios");

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api";

// Test state - stores IDs and tokens
const state = {
  customerToken: null,
  staffToken: null,
  serviceId: null,
  branchId: null,
  categoryId: null,
  tokenId: null,
};

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper: Print test result
function printResult(testName, success, data = null, error = null) {
  const icon = success ? "✅" : "❌";
  console.log(`\n${icon} ${testName}`);

  if (success && data) {
    console.log(
      "   Response:",
      JSON.stringify(data, null, 2).split("\n").slice(0, 10).join("\n   "),
    );
    if (JSON.stringify(data).length > 500) {
      console.log("   ... (truncated)");
    }
  }

  if (!success && error) {
    console.log("   Error:", error.response?.data?.message || error.message);
  }
}

// Helper: Wait between requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== TEST FUNCTIONS ====================

async function testHealthCheck() {
  try {
    const res = await axios.get("http://localhost:5000/health");
    printResult("Health Check", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Health Check", false, null, error);
    return false;
  }
}

async function testSignupCustomer() {
  try {
    const res = await api.post("/auth/signup", {
      name: "API Test Customer",
      email: `customer_${Date.now()}@test.com`,
      password: "password123",
    });
    state.customerToken = res.data.data.token;
    printResult("Signup Customer", res.data.success, res.data);
    return true;
  } catch (error) {
    // If user exists, try login
    if (error.response?.data?.message?.includes("already exists")) {
      console.log("   ℹ️  User exists, will login instead");
      return true;
    }
    printResult("Signup Customer", false, null, error);
    return false;
  }
}

async function testSignupStaff() {
  try {
    const res = await api.post("/auth/signup", {
      name: "API Test Staff",
      email: `staff_${Date.now()}@test.com`,
      password: "password123",
      role: "STAFF",
    });
    state.staffToken = res.data.data.token;
    printResult("Signup Staff", res.data.success, res.data);
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes("already exists")) {
      console.log("   ℹ️  Staff exists, will login instead");
      return true;
    }
    printResult("Signup Staff", false, null, error);
    return false;
  }
}

async function testLoginCustomer() {
  try {
    const res = await api.post("/auth/login", {
      email: "customer@test.com",
      password: "password123",
    });
    state.customerToken = res.data.data.token;
    printResult("Login Customer", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Login Customer", false, null, error);
    return false;
  }
}

async function testLoginStaff() {
  try {
    const res = await api.post("/auth/login", {
      email: "staff@test.com",
      password: "password123",
    });
    state.staffToken = res.data.data.token;
    printResult("Login Staff", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Login Staff", false, null, error);
    return false;
  }
}

async function testGetServices() {
  try {
    const res = await api.get("/services", {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    if (res.data.data && res.data.data.length > 0) {
      state.serviceId = res.data.data[0]._id;
    }
    printResult("Get Services", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Services", false, null, error);
    return false;
  }
}

async function testGetBranches() {
  try {
    const res = await api.get(`/branches?serviceId=${state.serviceId}`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    if (res.data.data && res.data.data.length > 0) {
      state.branchId = res.data.data[0]._id;
    }
    printResult("Get Branches", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Branches", false, null, error);
    return false;
  }
}

async function testGetCategories() {
  try {
    const res = await api.get(`/categories?branchId=${state.branchId}`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    if (res.data.data && res.data.data.length > 0) {
      state.categoryId = res.data.data[0]._id;
    }
    printResult("Get Categories", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Categories", false, null, error);
    return false;
  }
}

async function testGetSlotPreview() {
  try {
    const res = await api.get(`/slots/${state.branchId}/${state.categoryId}`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    printResult("Get Slot Preview", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Slot Preview", false, null, error);
    return false;
  }
}

async function testBookToken() {
  try {
    const res = await api.post(
      "/tokens",
      {
        serviceId: state.serviceId,
        branchId: state.branchId,
        categoryId: state.categoryId,
      },
      {
        headers: { Authorization: `Bearer ${state.customerToken}` },
      },
    );
    state.tokenId = res.data.data.tokenId;
    printResult("Book Token", res.data.success, res.data);
    return true;
  } catch (error) {
    // If already has token, get existing
    if (error.response?.data?.data?.existingTokenId) {
      state.tokenId = error.response.data.data.existingTokenId;
      console.log("   ℹ️  Already has token, using existing:", state.tokenId);
      return true;
    }
    printResult("Book Token", false, null, error);
    return false;
  }
}

async function testGetTokenDetails() {
  try {
    const res = await api.get(`/tokens/${state.tokenId}`, {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    printResult("Get Token Details", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Token Details", false, null, error);
    return false;
  }
}

async function testGetMyTokens() {
  try {
    const res = await api.get("/tokens/my?grouped=true", {
      headers: { Authorization: `Bearer ${state.customerToken}` },
    });
    printResult("Get My Tokens (Grouped)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get My Tokens (Grouped)", false, null, error);
    return false;
  }
}

async function testGetLiveQueue() {
  try {
    const res = await api.get(`/queue/${state.branchId}/${state.categoryId}`);
    printResult("Get Live Queue (Public)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Live Queue (Public)", false, null, error);
    return false;
  }
}

async function testCallNextToken() {
  try {
    const res = await api.post(
      "/queue/next",
      {
        branchId: state.branchId,
        categoryId: state.categoryId,
      },
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );
    // Update tokenId to the called token
    if (res.data.data?.token?.tokenId) {
      state.tokenId = res.data.data.token.tokenId;
    }
    printResult("Call Next Token (Staff)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Call Next Token (Staff)", false, null, error);
    return false;
  }
}

async function testCompleteToken() {
  try {
    const res = await api.post(
      `/tokens/${state.tokenId}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );
    printResult("Complete Token (Staff)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Complete Token (Staff)", false, null, error);
    return false;
  }
}

async function testGetQueueStatus() {
  try {
    const res = await api.get(
      `/queue/status?branchId=${state.branchId}&categoryId=${state.categoryId}`,
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );
    printResult("Get Queue Status (Staff)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Get Queue Status (Staff)", false, null, error);
    return false;
  }
}

// Book another token for skip test
async function testBookAnotherToken() {
  try {
    // Create a new user to book another token
    const newEmail = `user_${Date.now()}@test.com`;
    const signupRes = await api.post("/auth/signup", {
      name: "Skip Test User",
      email: newEmail,
      password: "password123",
    });
    const newToken = signupRes.data.data.token;

    const res = await api.post(
      "/tokens",
      {
        serviceId: state.serviceId,
        branchId: state.branchId,
        categoryId: state.categoryId,
      },
      {
        headers: { Authorization: `Bearer ${newToken}` },
      },
    );
    state.tokenId = res.data.data.tokenId;
    printResult(
      "Book Another Token (for skip test)",
      res.data.success,
      res.data,
    );
    return true;
  } catch (error) {
    printResult("Book Another Token", false, null, error);
    return false;
  }
}

async function testSkipToken() {
  try {
    // First call the token
    await api.post(
      "/queue/next",
      {
        branchId: state.branchId,
        categoryId: state.categoryId,
      },
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );

    const res = await api.post(
      `/tokens/${state.tokenId}/skip`,
      {},
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );
    printResult("Skip Token (Staff)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Skip Token (Staff)", false, null, error);
    return false;
  }
}

async function testRequeueToken() {
  try {
    const res = await api.post(
      `/tokens/${state.tokenId}/requeue`,
      {},
      {
        headers: { Authorization: `Bearer ${state.staffToken}` },
      },
    );
    printResult("Requeue Token (Staff)", res.data.success, res.data);
    return true;
  } catch (error) {
    printResult("Requeue Token (Staff)", false, null, error);
    return false;
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runTests() {
  console.log(
    "╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║       QUEUE MANAGEMENT SYSTEM - API TEST SUITE               ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );
  console.log(`\n📍 Base URL: ${BASE_URL}`);
  console.log(`📅 Date: ${new Date().toISOString()}`);

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "Signup Customer", fn: testSignupCustomer },
    { name: "Signup Staff", fn: testSignupStaff },
    { name: "Login Customer", fn: testLoginCustomer },
    { name: "Login Staff", fn: testLoginStaff },
    { name: "Get Services", fn: testGetServices },
    { name: "Get Branches", fn: testGetBranches },
    { name: "Get Categories", fn: testGetCategories },
    { name: "Get Slot Preview", fn: testGetSlotPreview },
    { name: "Book Token", fn: testBookToken },
    { name: "Get Token Details", fn: testGetTokenDetails },
    { name: "Get My Tokens", fn: testGetMyTokens },
    { name: "Get Live Queue", fn: testGetLiveQueue },
    { name: "Call Next Token", fn: testCallNextToken },
    { name: "Complete Token", fn: testCompleteToken },
    { name: "Get Queue Status", fn: testGetQueueStatus },
    { name: "Book Another Token", fn: testBookAnotherToken },
    { name: "Skip Token", fn: testSkipToken },
    { name: "Requeue Token", fn: testRequeueToken },
  ];

  console.log("\n" + "═".repeat(60));
  console.log("RUNNING TESTS...");
  console.log("═".repeat(60));

  for (const test of tests) {
    await delay(300); // Small delay between tests
    const passed = await test.fn();
    results.tests.push({ name: test.name, passed });
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Print summary
  console.log("\n" + "═".repeat(60));
  console.log("TEST SUMMARY");
  console.log("═".repeat(60));
  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.tests.length}`);
  console.log(
    `📈 Rate:   ${((results.passed / results.tests.length) * 100).toFixed(1)}%`,
  );

  if (results.failed > 0) {
    console.log("\n❌ Failed Tests:");
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => console.log(`   • ${t.name}`));
  }

  console.log("\n" + "═".repeat(60));
  console.log(
    results.failed === 0 ? "🎉 ALL TESTS PASSED!" : "⚠️  SOME TESTS FAILED",
  );
  console.log("═".repeat(60) + "\n");

  // Print stored IDs for reference
  console.log("📝 Stored IDs:");
  console.log(`   • serviceId:  ${state.serviceId}`);
  console.log(`   • branchId:   ${state.branchId}`);
  console.log(`   • categoryId: ${state.categoryId}`);
  console.log(`   • tokenId:    ${state.tokenId}`);
  console.log("");

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
