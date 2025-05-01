import axios from "axios";
import https from "https";
import crypto from "crypto";

// Bitget API credentials
const BASE_URL = "https://api.bitget.com";
const API_KEY = process.env.BITGET_API_KEY;
const API_SECRET = process.env.BITGET_SECRET_KEY;
const PASSPHRASE = process.env.BITGET_PASSPHRASE;

// Local IP to bind requests
const LOCAL_IP = "192.168.148.206";

/**
 * Makes a request to Bitget API binding to local IP
 */
export async function bitgetRequest(method, endpoint, params = {}) {
  try {
    const timestamp = Date.now().toString();
    const requestPath = endpoint.includes("?") ? endpoint.split("?")[0] : endpoint;

    let body = "";
    if (method === "POST" && Object.keys(params).length > 0) {
      body = JSON.stringify(params);
    }

    const message = timestamp + method + requestPath + body;
    const signature = crypto.createHmac("sha256", API_SECRET).update(message).digest("base64");

    let url = `${BASE_URL}${endpoint}`;
    if (method === "GET" && Object.keys(params).length > 0 && !endpoint.includes("?")) {
      const queryString = new URLSearchParams(params).toString();
      url = `${url}?${queryString}`;
    }

    const headers = {
      "ACCESS-KEY": API_KEY,
      "ACCESS-SIGN": signature,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": PASSPHRASE,
      "Content-Type": "application/json",
    };

    const agent = new https.Agent({
      localAddress: LOCAL_IP, // This is where we bind to your IP
    });

    const response = await axios({
      method,
      url,
      headers,
      data: body || undefined,
      httpsAgent: agent,
    });

    return response.data;
  } catch (error) {
    console.error("Bitget API request failed:", error.message);
    throw error;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance() {
  return bitgetRequest("GET", "/api/v2/spot/account/assets");
}

/**
 * Test connection to Bitget API
 */
export async function testConnection() {
  try {
    const response = await getAccountBalance();
    return {
      success: true,
      data: response,
      message: "Successfully connected to Bitget API",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to connect to Bitget API",
    };
  }
}
