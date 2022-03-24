/* eslint no-param-reassign: 0 */
/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */
import { Client, Collection, Intents } from "discord.js";
import { readdirSync } from "fs";
import logger from "../logger";

const configureCommands = (client: Client) => {
  client.commands = new Collection();

  const commandFiles = readdirSync(`${__dirname}/commands`).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js"),
  );

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (e) {
      logger.error({ err: e });
      await interaction.reply({
        content: "Erro ao executar o comando!",
        ephemeral: true,
      });
    }
  });
};

const configureEvents = (client: Client) => {
  const eventFiles = readdirSync(`${__dirname}/events`).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js"),
  );

  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
};

const configureBotClient = async (): Promise<Client> => {
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  });

  configureCommands(client);
  configureEvents(client);

  await client.login(process.env.DISCORDJS_BOT_TOKEN);
  return client;
};

const notifyTextChannel = process.env.DISCORD_NOTIFIER_TEXT_CHANNEL_NAME;

export { configureBotClient, notifyTextChannel };
