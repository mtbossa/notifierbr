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

client.on('stockRefilled', url => {
	log('Stock refilled!');
	const channel = client.channels.cache.find(
		channel => (channel as TextChannel).name === notifyTextChannel
	);
	const exampleEmbed = new MessageEmbed()
		.setColor('##f58442')
		.setTitle('Some title')
		.setURL('https://discord.js.org/')
		.setAuthor({
			name: 'Some name',
			iconURL: 'https://i.imgur.com/AfFp7pu.png',
			url: 'https://discord.js.org',
		})
		.setDescription('Some description here')
		.setThumbnail('https://i.imgur.com/AfFp7pu.png')
		.addFields(
			{ name: 'Regular field title', value: 'Some value here' },
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Inline field title', value: 'Some value here', inline: true },
			{ name: 'Inline field title', value: 'Some value here', inline: true }
		)
		.addField('Inline field title', 'Some value here', true)
		.setImage('https://i.imgur.com/AfFp7pu.png')
		.setTimestamp()
		.setFooter({
			text: 'Some footer text here',
			iconURL: 'https://i.imgur.com/AfFp7pu.png',
		});
	// (channel as TextChannel).send(`Em estoque. Link: ${url}`);
	(channel as TextChannel).send({ embeds: [exampleEmbed] });
});
