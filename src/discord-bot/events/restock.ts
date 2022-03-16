import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '..';
import { log } from '../../helpers/general';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { JordanData } from '../../services/nikeFlashDropsMonitorService';

module.exports = {
	name: 'restock',
	execute(client: Client, newSneakerData: SneakerData) {
		const channel = client.channels.cache.find(channel => (channel as TextChannel).name === notifyTextChannel);

		const exampleEmbed = new MessageEmbed()
			.setColor('#f58442')
			.setTitle(newSneakerData.name)
			.setURL(newSneakerData.url)
			.setDescription('Restock! :rocket:')
			.setThumbnail(newSneakerData.imgUrl)
			.setTimestamp();

		(channel as TextChannel).send({ embeds: [exampleEmbed] });
	},
};
