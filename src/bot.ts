import { config } from 'dotenv';
import {
	Client,
	ClientOptions,
	Intents,
	MessageEmbed,
	TextChannel,
} from 'discord.js';
import { log } from './helpers';

config(); // Configures .env
const prefix = '#';
const notifyTextChannel = process.env.DISCORD_NOTIFIER_TEXT_CHANNEL_NAME;

const configureBotClient = () => {
	console.log(
		'Text channel to notify: ',
		notifyTextChannel,
		'\n------------------------------------------'
	);

	const clientOptions: ClientOptions = {
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
	};
	const client = new Client(clientOptions);
	client.login(process.env.DISCORDJS_BOT_TOKEN);

	return client;
};
const client = configureBotClient();
export default client;

client.on('ready', () => {
	console.log('Bot is ready!\n------------------------------------------');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	if (args) {
		const command = args.shift()!.toLowerCase();
		if (command == 'kill') {
			log('kill', 'oi');
			client.removeAllListeners();
			client.destroy();
			return;
		}
	}
});

client.on('error', err => {
	console.warn(err);
});

client.on('outOfStock', param => {
	const channel = client.channels.cache.find(
		channel => (channel as TextChannel).name === notifyTextChannel
	);
	log(param);
});

client.on('stockRefilled', product => {
	log('Stock refilled!');
	const channel = client.channels.cache.find(
		channel => (channel as TextChannel).name === notifyTextChannel
	);
	const exampleEmbed = new MessageEmbed()
		.setColor('#f58442')
		.setTitle(product.name)
		.setURL(product.url)
		.setAuthor({
			name: 'Estoque disponível!',
			iconURL: product.store_image,
			url: 'https://discord.js.org',
		})
		.setDescription('Some description here :rocket:')
		.setThumbnail(product.image_url)
		.setTimestamp()
		.setFooter({
			text: 'Some footer text here',
		});
	(channel as TextChannel).send({ embeds: [exampleEmbed] });
});
