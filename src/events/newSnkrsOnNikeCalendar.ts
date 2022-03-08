import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '../bot';
import { log } from '../helpers/general';
import { SnkrsData } from '../services/nikeSnkrsCalendarMonitorService';

module.exports = {
	name: 'newSnkrsOnNikeCalendar',
	execute(client: Client, snkrsData: Array<SnkrsData>) {
		log('New snkr on calendar!', snkrsData);
		const channel = client.channels.cache.find(
			channel => (channel as TextChannel).name === notifyTextChannel
		);
		snkrsData.forEach(snkrsData => {
			const exampleEmbed = new MessageEmbed()
				.setAuthor({ name: snkrsData.launchDate })
				.setColor('#f58442')
				.setTitle(snkrsData.name)
				.setURL(snkrsData.url)
				.setDescription(
					`Novo calendário! Preço: ${snkrsData.price.toString()} :rocket:`
				)
				.setThumbnail(snkrsData.imgUrl)
				.setTimestamp();
			(channel as TextChannel).send({ embeds: [exampleEmbed] });
		});
	},
};
