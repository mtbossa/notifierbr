import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { readdirSync } from "fs";
import { Routes } from "discord-api-types/v9";

const commands: SlashCommandBuilder[] = [];

const commandFiles = readdirSync(`${__dirname}/commands`).filter(
  (file) => file.endsWith(".ts") || file.endsWith("js"),
);

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.DISCORDJS_BOT_TOKEN!);

rest
  .put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
    { body: commands },
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
