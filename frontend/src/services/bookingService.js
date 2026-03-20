import { auth } from "../firebase";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("Please login to continue");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function toggleGuideAvailability(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/guide/availability`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getAvailableGuides() {
  const response = await fetch(`${BACKEND_URL}/api/guides?available=true`);
  return handleResponse(response);
}

export async function createBookingRequest(payload) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}/api/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
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
  const response = await fetch(`${BACKEND_URL}/api/bookings?role=${role}`, {
    method: "GET",
    headers,
  });

  return handleResponse(response);
}
