import { Client } from "discord.js";
import { exitHandler } from "./helpers/general";
import { configureBotClient } from "./discord-bot"; // Runs code when imported (bot.ts runs code when called)
import createNikeFlashDropMonitor from "./monitors/Nike/FlashDropMonitor/NikeFlashDropMonitorFactory";
import createRestockDropMonitor from "./monitors/Nike/RestockMonitor/NikeRestockMonitorFactory";

const startNikeFlashDropsMonitors = async (discordClient: Client) => {
  const monitor = createNikeFlashDropMonitor(discordClient);
  monitor.start();
};

const startNikeRestockMonitors = async (discordClient: Client) => {
  const monitor = await createRestockDropMonitor(discordClient);
  monitor.start();
};

// Starts all process
(async () => {
  process.stdin.resume();
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  const client = await configureBotClient();

  startNikeFlashDropsMonitors(client);
  startNikeRestockMonitors(client);

  // startNikeSnkrsCalendarMonitor();
})();
