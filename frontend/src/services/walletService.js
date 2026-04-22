import { auth } from "../firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

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
 * @returns {object} Order details from Razorpay
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
 * @param {object} paymentData - Contains razorpay_order_id, razorpay_payment_id, razorpay_signature, amount
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
