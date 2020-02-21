import { dynamic_scoring } from '@/config.json'

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

export const computeScore = (num_solves) => {
  const { K, V, minpts, maxpts } = dynamic_scoring;

  return Math.trunc(
    Math.max(
      minpts,
      Math.floor(maxpts - K * Math.log((num_solves + V) / (1 + V), 2))
    )
  );
}
