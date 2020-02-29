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

String.prototype.splice = function (idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

export const getTeamPath = teamName =>
  sha256(teamName)
    .splice(1, 0, "/")
    .splice(5, 0, "/");

export const validCountries = [
  'ad', 'ae', 'af', 'ag', 'ai', 'al', 'am', 'ao',
  'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az',
  'ba', 'bb', 'bd', 'be', 'bf', 'bg', 'bh', 'bi',
  'bj', 'bl', 'bm', 'bn', 'bo', 'bq', 'br', 'bs',
  'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd',
  'cf', 'cg', 'ch', 'ci', 'ck', 'cl', 'cm', 'cn',
  'co', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz',
  'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee',
  'eg', 'eh', 'er', 'es', 'et', 'eu', 'fi', 'fj',
  'fk', 'fm', 'fo', 'fr', 'ga', 'gb-eng', 'gb-nir', 'gb-sct',
  'gb-wls', 'gb', 'gd', 'ge', 'gf', 'gg', 'gh', 'gi',
  'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt',
  'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht',
  'hu', 'id', 'ie', 'il', 'im', 'in', 'io', 'iq',
  'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke',
  'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw',
  'ky', 'kz', 'la', 'lb', 'lc', 'li', 'lk', 'lr',
  'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md',
  'me', 'mf', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn',
  'mo', 'mp', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv',
  'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf',
  'ng', 'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz',
  'om', 'pa', 'pe', 'pf', 'pg', 'ph', 'pk', 'pl',
  'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa',
  're', 'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc',
  'sd', 'se', 'sg', 'sh', 'si', 'sj', 'sk', 'sl',
  'sm', 'sn', 'so', 'sr', 'ss', 'st', 'sv', 'sx',
  'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj',
  'tk', 'tl', 'tm', 'tn', 'to', 'tr', 'tt', 'tv',
  'tw', 'tz', 'ua', 'ug', 'um', 'un', 'us', 'uy',
  'uz', 'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu',
  'wf', 'ws', 'ye', 'yt', 'za', 'zm', 'zw',
]