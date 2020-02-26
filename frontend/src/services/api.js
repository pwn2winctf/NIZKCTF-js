import axios from "axios";

import config from "@/config.json";
import { getTeamPath, encodeForm } from "@/utils";

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
  getChallengeDescription: (challenge, language) =>
    api.get(`challenges/${challenge}.${language.toLowerCase()}.md`, {
      baseURL: "https://pwn2.win/2019/"
    }), // TODO remove baseURL
  getTeam: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/team.json`);
  },
  getTeamMembers: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/members.json`);
  },
  postAccessToken: code => api.post("/login/oauth/access_token", encodeForm({
    code, client_id: config.client_id, client_secret: config.client_secret
  }), {
    baseURL: config.repohost,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }

  })
};
