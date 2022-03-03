import { config } from 'dotenv';
import { Client, ClientOptions, Intents } from 'discord.js';

config();

const clientOptions: ClientOptions = {
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
};
const client = new Client(clientOptions);
client.login(process.env.DISCORDJS_BOT_TOKEN);
