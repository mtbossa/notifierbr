import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '..';
import { log } from '../../helpers/general';
import { JordanData } from '../../services/nikeFlashDropsMonitorService';

module.exports = {
	name: 'flashDrop',
	execute(client: Client, jordansData: Array<JordanData>) {
		log('Flash Drop!', jordansData);
    const channel = client.channels.cache.find(
      channel => (channel as TextChannel).name === notifyTextChannel
    );
		jordansData.forEach(jordanData => {
			const exampleEmbed = new MessageEmbed()
				.setColor('#f58442')
				.setTitle(jordanData.name)
				.setURL(jordanData.url)
				.setDescription('Flash Drop! :rocket:')
				.setThumbnail(jordanData.imgUrl)
				.setTimestamp();

			(channel as TextChannel).send({ embeds: [exampleEmbed] });
		});
	},
};
