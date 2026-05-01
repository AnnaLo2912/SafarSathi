import axios from "axios";

const fetchClimateAverages = async (lat, lon, startDate, duration) => {
  try {
    const start = new Date(startDate);
    const end   = new Date(startDate);
    end.setDate(end.getDate() + duration);

    const histStart = new Date(start); histStart.setFullYear(histStart.getFullYear() - 1);
    const histEnd   = new Date(end);   histEnd.setFullYear(histEnd.getFullYear() - 1);

    const fmt = (d) => d.toISOString().split('T')[0];
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${fmt(histStart)}&end_date=${fmt(histEnd)}`;

    console.log("Fetching", url);
    const response = await axios.get(url);
    console.log("Success");
  } catch (err) {
    console.error("🌤 Climate average fetch error:", err.response?.data || err.message);
  }
};

fetchClimateAverages(40.71, -74.00, "2026-06-01", 5);
