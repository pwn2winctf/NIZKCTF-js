import { dynamic_scoring } from "@/config.json";
import { sha256 } from "js-sha256";

export const createPolling = (callback, milliseconds = 60000) => {
  let interval;
  return {
    running: false,
    async start() {
      if (this.running) {
        return;
      }

      this.running = true;

      callback();
      interval = setInterval(() => callback(), milliseconds);
    },
    stop() {
      this.running = false;
      clearInterval(interval);
    }
  };
};

export const encodeForm = data => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
};

export const colors = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000"
];

export const computeScore = num_solves => {
  const { K, V, minpts, maxpts } = dynamic_scoring;

  return Math.trunc(
    Math.max(
      minpts,
      Math.floor(maxpts - K * Math.log2((num_solves + V) / (1 + V)))
    )
  );
};

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

export const getTeamPath = teamName =>
  sha256(teamName)
    .splice(1, 0, "/")
    .splice(5, 0, "/");
