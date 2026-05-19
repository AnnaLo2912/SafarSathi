import { auth } from "../firebase";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please login to continue");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

/**
 * Get wallet balance for current user
 */
export async function getWalletBalance() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/balance`, {
    method: "GET",
    headers,
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Create a Razorpay order for wallet top-up
 * @param {number} amountINR - Amount in INR
 */
export async function createRazorpayOrder(amountINR) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/order`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: amountINR,
      currency: "INR",
    }),
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Verify payment signature and top up wallet
 * @param {object} paymentData - razorpay_order_id, razorpay_payment_id, razorpay_signature, amount
 */
export async function verifyTopUp(paymentData) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/verify-topup`, {
    method: "POST",
    headers,
    body: JSON.stringify(paymentData),
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Get transaction history for current user
 */
export async function getTransactions() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/transactions`, {
    method: "GET",
    headers,
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Add dummy money to wallet (for testing purposes)
 * @param {number} amountINR - Amount in INR
 * @param {string} currency - Original currency code (USD, EUR, etc.)
 */
export async function addDummyMoney(amountINR, currency = "USD") {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/add-dummy-money`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      amount: amountINR,
      currency: currency,
    }),
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Process phone number UPI payment and add funds to wallet
 * @param {object} params - phoneNumber, amount (in INR), currency (original)
 */
export async function processPhonePayment({ phoneNumber, amount, currency }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/phone-payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      phoneNumber,
      amount,
      currency,
    }),
  });
  const result = await handleResponse(response);
  return result.data;
}

/**
 * Send money from wallet to a phone number
 * @param {object} params - recipientPhone, amount (in INR), currency (original)
 */
export async function sendMoneyToPhone({ recipientPhone, amount, currency }) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/wallet/send-to-phone`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      recipientPhone,
      amount,
      currency,
    }),
  });
  const result = await handleResponse(response);
  return result.data;
}