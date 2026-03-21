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

export async function toggleGuideAvailability(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/guide/availability`, {
    method: "PATCH", headers, body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getVerificationStatus() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/verification/status`, { method: "GET", headers });
  return handleResponse(response);
}

export async function uploadCertificateForVerification(file, declaredFullName = "") {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please login to continue");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("declared_full_name", declaredFullName);
  const response = await fetch(`${BACKEND_URL}/api/verification/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
}

export async function getAvailableGuides() {
  const response = await fetch(`${BACKEND_URL}/api/guides?available=true`);
  return handleResponse(response);
}

// Fetch tourist's saved trips for itinerary sharing
export async function getMyTripsForSharing() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/trips/my`, { method: "GET", headers });
  return handleResponse(response);
}

export async function createBookingRequest(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload), // payload can include tripId
  });
  return handleResponse(response);
}

export async function cancelBooking(bookingId) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers,
  });
  return handleResponse(response);
}

export async function updateBookingStatus(bookingId, action) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ action }),
  });
  return handleResponse(response);
}

export async function getBookings(role) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/bookings?role=${role}`, { method: "GET", headers });
  return handleResponse(response);
}

export async function deleteGuideAccountData() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/guide/account`, { method: "DELETE", headers });
  return handleResponse(response);
}

export async function deactivateGuideAccountData() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/guide/deactivate`, { method: "PATCH", headers });
  return handleResponse(response);
}

export async function reactivateGuideAccountData() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/guide/reactivate`, { method: "PATCH", headers });
  return handleResponse(response);
}