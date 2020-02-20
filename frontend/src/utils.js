export const createPooling = (callback, milliseconds = 60000) => {
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
