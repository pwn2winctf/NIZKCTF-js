import axios from "axios";

import config from "@/config.json";
import { getTeamPath } from "@/utils";

const api = axios.create({
  baseURL: config.submissionsBasePath
});

export const API = {
  listNews: () => api.get("/news.json"),
  listSolvedChallenges: () => api.get("/accepted-submissions.json"),
  getChallenges: () =>
    api.get("/challenges/index.json", { baseURL: "https://pwn2.win/2019/" }), // TODO remove baseURL
  getChallenge: challenge =>
    api.get(`/challenges/${challenge}.json`, {
      baseURL: "https://pwn2.win/2019/"
    }), // TODO remove baseURL
  getTeam: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/team.json`);
  }
};
