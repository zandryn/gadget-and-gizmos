// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const fetchDevices = async () => {
  return await axios.get(`${API_BASE_URL}/devices`);
};

export const fetchDeviceById = async (id) => {
  return await axios.get(`${API_BASE_URL}/devices/${id}`);
};

export const createDevice = async (deviceData) => {
  return await axios.post(`${API_BASE_URL}/devices`, deviceData);
};

export const updateDevice = async (id, deviceData) => {
  return await axios.put(`${API_BASE_URL}/devices/${id}`, deviceData);
};

export const deleteDevice = async (id) => {
  return await axios.delete(`${API_BASE_URL}/devices/${id}`);
};