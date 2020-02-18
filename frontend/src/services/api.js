import axios from "axios";
import config from "@/config.json";

const api = axios.create({
  baseURL: config.submissionsBasePath
});

export const API = {
  listNews: () => api.get("/news.json"),
  listSolvedChallenges: () => api.get("/accepted-submissions.json")
};
