import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '..';
import { log } from '../../helpers/general';
import { SneakerData } from '../../models/interfaces/SneakerDataInterface';
import { JordanData } from '../../services/nikeFlashDropsMonitorService';

module.exports = {
  name: 'searchFoundSneaker',
  execute(client: Client, newSneakers: SneakerData[]) {
    const channel = client.channels.cache.find((channel) => (channel as TextChannel).name === notifyTextChannel);
    newSneakers.forEach((sneakerData: SneakerData) => {
      const exampleEmbed = new MessageEmbed()
        .setColor('#f58442')
        .setTitle(sneakerData.name)
        .setURL(sneakerData.url)
        .setDescription('Novidade! :rocket:')
        .setThumbnail(sneakerData.imgUrl)
        .setTimestamp();

      (channel as TextChannel).send({ embeds: [exampleEmbed] });
    });
  },
};
