import { Application } from "spectron";

export const mochaHooks = {
  async beforeAll() {
    this.timeout(10000);
    const binPath = process.env.OBSIDIAN_BIN;
    this.app = new Application({
      path: binPath,
      chromeDriverArgs: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    console.log("Starting obsidian...");
    await this.app.start();
  },
  async afterAll() {
    console.log("Stopping obsidian...");
    if (this.app && this.app.isRunning()) {
      await this.app.stop();
    }
    return;
  },
};
