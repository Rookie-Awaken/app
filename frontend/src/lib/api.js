import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const api = {
  getSubjects: async () => (await client.get("/subjects")).data,
  createUser: async (name) => (await client.post("/users", { name })).data,
  getPracticeQuestions: async (subject, limit = 10) =>
    (await client.get(`/questions/practice/${subject}`, { params: { limit } })).data,
  getMockQuestions: async (per_subject = 10) =>
    (await client.get(`/questions/mock`, { params: { per_subject } })).data,
  submitResult: async (payload) => (await client.post("/results", payload)).data,
  getUserResults: async (userId) => (await client.get(`/results/user/${userId}`)).data,
  getLeaderboard: async (params = {}) => (await client.get(`/leaderboard`, { params })).data,
};

export default api;
