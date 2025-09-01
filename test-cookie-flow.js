const axios = require("axios");

const API_BASE = "http://localhost:4000/api";

async function testCookieFlow() {
  console.log("🧪 Testing Cookie Flow...\n");

  try {
    // Step 1: Test setting a cookie
    console.log("1️⃣ Setting test cookie...");
    const setCookieResponse = await axios.get(`${API_BASE}/debug/set-cookie`, {
      withCredentials: true,
    });
    console.log("✅ Cookie set response:", setCookieResponse.data);

    // Step 2: Test retrieving the cookie
    console.log("\n2️⃣ Checking if cookie is sent back...");
    const checkCookieResponse = await axios.get(
      `${API_BASE}/debug/check-cookies`,
      {
        withCredentials: true,
      }
    );
    console.log("✅ Cookies received:", checkCookieResponse.data.cookies);

    // Step 3: Test JWT functionality
    console.log("\n3️⃣ Testing JWT functionality...");
    const jwtResponse = await axios.get(`${API_BASE}/debug/jwt-test`);
    console.log("✅ JWT test response:", jwtResponse.data);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testCookieFlow();

