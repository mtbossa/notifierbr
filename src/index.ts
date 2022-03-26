import { Client } from "discord.js";
import { exitHandler } from "./helpers/general";
import { configureDiscordBotClient } from "./discord-bot"; // Runs code when imported (bot.ts runs code when called)
import createNikeFlashDropMonitor from "./monitors/Nike/FlashDropMonitor/NikeFlashDropMonitorFactory";
import createRestockDropMonitor from "./monitors/Nike/RestockMonitor/NikeRestockMonitorFactory";
import createArtwalkRestockMonitor from "./monitors/Artwalk/RestockMonitor/ArtwalkRestockMonitorFactory";

const startNikeFlashDropsMonitors = async (discordClient: Client) => {
  const monitor = createNikeFlashDropMonitor(discordClient);
  monitor.start();
};

const startNikeRestockMonitors = async (discordClient: Client) => {
  const monitor = await createRestockDropMonitor(discordClient);
  monitor.start();
};

const startArtwalkRestockMonitors = async (discordClient: Client) => {
  const monitor = await createArtwalkRestockMonitor(discordClient);
  monitor.start();
};

// Starts all process
(async () => {
  process.stdin.resume();
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));
  const client = await configureDiscordBotClient();

  startArtwalkRestockMonitors(client);

  // startNikeFlashDropsMonitors(client);
  // startNikeRestockMonitors(client);
})();
