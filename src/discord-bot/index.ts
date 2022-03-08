import {
	Client,
	Intents,
} from 'discord.js';
import { readdirSync } from 'fs';

const configureBotClient = () => {
	const client = new Client({
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
	});
	const eventFiles = readdirSync(__dirname + '/events').filter(file =>
		file.endsWith('.ts')
	);

	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
	client.login(process.env.DISCORDJS_BOT_TOKEN);

	return client;
};

const client = configureBotClient();
const notifyTextChannel = process.env.DISCORD_NOTIFIER_TEXT_CHANNEL_NAME;

export { client, notifyTextChannel };
