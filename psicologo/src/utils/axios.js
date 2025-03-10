import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // URL base do backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
