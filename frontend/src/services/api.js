import axios from "axios";
import { getTime } from "date-fns";

import config from "@/config.json";
import { getTeamPath } from "@/utils";

const api = axios.create({
  baseURL: config.submissionsBasePath
});

const now = () => Math.floor(+getTime(new Date()));

export const API = {
  listNews: () => api.get(`/news.json?_${now()}`),
  listSolvedChallenges: () => api.get(`/accepted-submissions.json?_${now()}`),
  getChallenges: () =>
    api.get(`/challenges/index.json?_${now()}`, {
      baseURL: config.challegesBasePath
    }),
  getChallenge: challenge =>
    api.get(`/challenges/${challenge}.json?_${now()}`, {
      baseURL: config.challegesBasePath
    }),
  getChallengeDescription: (challenge, language) =>
    api.get(`challenges/${challenge}.${language.toLowerCase()}.md?_${now()}`, {
      baseURL: config.challegesBasePath
    }),
  getTeam: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/team.json?_${now()}`);
  },
  getTeamMembers: teamName => {
    const path = getTeamPath(teamName);
    return api.get(`/${path}/members.json?_${now()}`);
  },
  getAccessToken: code =>
    api.get(`/authenticate/${code}`, { baseURL: config.gatekeeperBasePath }),
  getFaq: async () => {
    const response = await api.get("/FAQ.md", { baseURL: config.faqBasePath });
    return response.data;
  },
  getRules: async language => {
    const file = language === "en" ? "rules.md" : "regras.md";

    const response = await api.get(`/${file}`, {
      baseURL: config.faqBasePath
    });
    return response.data;
  }
};
