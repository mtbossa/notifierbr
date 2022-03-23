import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { notifyTextChannel } from '..';
import { DiscordSneakerData } from '../models/interfaces/DiscordSneakerData';

module.exports = {
  name: 'flashDrop',
  execute(client: Client, newSneakers: DiscordSneakerData[]) {
    const channel = client.channels.cache.find(
      (channel) => (channel as TextChannel).name === notifyTextChannel
    );
    newSneakers.forEach((DiscordSneakerData: DiscordSneakerData) => {
      const exampleEmbed = new MessageEmbed()
        .setColor('#f58442')
        .setTitle(DiscordSneakerData.name)
        .setURL(DiscordSneakerData.url)
        .setDescription(`Flash Drop! :rocket: ${DiscordSneakerData.styleCode}`)
        .setThumbnail(DiscordSneakerData.imgUrl)
        .setTimestamp();

      (channel as TextChannel).send({ embeds: [exampleEmbed] });
    });
  },
};
