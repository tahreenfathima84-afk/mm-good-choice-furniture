import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export { BACKEND_URL };

export const imgSrc = (u) => (u && u.startsWith("/api") ? `${BACKEND_URL}${u}` : u);

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
});

export const PHONE_DISPLAY = "+91 91106 90642";
export const PHONE_TEL = "tel:+919110690642";
export const WA_NUMBER = "919110690642";

export const waLink = (message) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const MAPS_DIRECTIONS =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036");

export const MAPS_EMBED =
  "https://www.google.com/maps?q=" +
  encodeURIComponent("Thambuchetty Palya, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036") +
  "&output=embed";
