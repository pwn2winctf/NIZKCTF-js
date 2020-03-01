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
    api.get("/challenges/index.json", { baseURL: config.challegesBasePath }),
  getChallenge: challenge =>
    api.get(`/challenges/${challenge}.json`, {
      baseURL: config.challegesBasePath
    }),
  getChallengeDescription: (challenge, language) =>
    api.get(`challenges/${challenge}.${language.toLowerCase()}.md`, {
      baseURL: config.challegesBasePath
    }),
  getTeam: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/team.json`);
  },
  getTeamMembers: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/members.json`);
  },
  getAccessToken: code =>
    api.get(`/authenticate/${code}`, { baseURL: config.gatekeeperBasePath })
};
